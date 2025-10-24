"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useNodesAndEdges } from "./useNodesAndEdges";
import { useSceneSetup } from "./useSceneSetup";
import { useGraphEvents } from "./useGraphEvents";

import { scanMaterial } from "./materials";
import { useHandCursor } from "./handtrack/useHandCursor";
import { handleNodeSelection } from "./handleNodeSelection";
import { useHandClick } from "./handtrack/useHandClick";


import { NodeInfoPanels } from "./nodeInfoPanels";
import { HandTracker } from "../HandTracker/HandTracker";
import { CursorHandTrack } from "./handtrack/cursorHandTrack";
import { TargetHandTrack } from "./handtrack/targetHandTrack";

import { updateCursorPos } from "../utils/updateCursorPos";
import { getClosestNode } from "../utils/getClosestNode";

export default function Graph3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const nodeInfoRef = useRef<HTMLDivElement>(null);
  const cursorUIRef = useRef<HTMLDivElement>(null);
  const targetUIRef = useRef<HTMLDivElement>(null);
  const newBoxSizeRef = useRef(25);
  const newScreenPos = useRef({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [infoOpacity, setInfoOpacity] = useState(0);
  const [infoVisible, setInfoVisible] = useState(false);
  const [cameraTransitioning, setCameraTransitioning] = useState(false);
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(false);
  const nodeMeshesRef = useRef<THREE.Mesh[]>([]);
  const nodePositions2DRef = useRef<{ x_: number; y_: number }[]>([]);
  const transitionFnRef = useRef<((now: number) => boolean) | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedNodeRef = useRef<number | null>(null);
  const clickConsumedRef = useRef(false);
  const animationFrameIdRef = useRef<number>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const controlsRef = useRef<any>();
  const landmarksRef = useRef<Array<Array<{ x: number; y: number; z: number }>>>([]);
  const handTrackerRef = useRef<HandTracker | null>(null);
  const { closestNodeIndex, isClicking } = useHandCursor(landmarksRef, nodePositions2DRef.current);
  const cursorPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!handTrackingEnabled) {
      if (handTrackerRef.current) {
        handTrackerRef.current.stop();
        handTrackerRef.current = null;
      }
      landmarksRef.current = [];
      return;
    }
    (async () => {
      const video = document.createElement("video");
      const tracker = await HandTracker.create(video, 30);
      handTrackerRef.current = tracker;
      tracker.onLandmarks = (landmarks) => {
        landmarksRef.current = landmarks;
      };
    })();
    return () => {
      if (handTrackerRef.current) {
        handTrackerRef.current.stop();
        handTrackerRef.current = null;
      }
    };
  }, [handTrackingEnabled]);

  useEffect(() => {
    if (!mountRef.current) return;
    const cameraDistance = 1;
    const cameraOffsetBack = 6;
    const transitionDurationMs = 800;
    const nodeSizeRelation = 0.35;
    const { scene, camera, renderer, controls, InitialCameraPos } = useSceneSetup(mountRef)!;
    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;
    const { nodes, nodeMeshes, edges, simplex, orbiters } = useNodesAndEdges(8, nodeSizeRelation);

    nodeMeshesRef.current = nodeMeshes;
    nodeMeshes.forEach((m) => scene.add(m));
    edges.forEach((e) => scene.add(e.line));
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const centerGlobal = new THREE.Vector3(0, 0, 0);
    const selectionDeps = {
      nodeMeshes: nodeMeshesRef.current,
      camera,
      controls,
      centerGlobal,
      cameraDistance,
      cameraOffsetBack,
      transitionDurationMs,
      selectedNodeRef,
      setSelectedNode,
      setCameraTransitioning,
      setInfoVisible,
      setInfoOpacity,
      transitionFnRef,
      scanTimeoutRef,
    };
    const { onClick, onDoubleClick, onMouseMove } = useGraphEvents({
      ...selectionDeps,
      raycaster,
      mouse,
      InitialCameraPos,
      setSelectedNode: (id) => handleNodeSelection(id, selectionDeps),
      bokehPass: null,
    });
    const onWindowResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onWindowResize);
    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("dblclick", onDoubleClick);
    renderer.domElement.addEventListener("mousemove", onMouseMove);

    const clock = new THREE.Clock();
    const animate = () => {
      scanMaterial.uniforms.time.value = performance.now() / 1000;
      const t = clock.getElapsedTime() * 0.2;
      const centerOfMass = new THREE.Vector3();
      nodeMeshes.forEach((m) => centerOfMass.add(m.position));
      centerOfMass.divideScalar(nodeMeshes.length);
      centerGlobal.copy(centerOfMass);
      const margin = 3;
      nodeMeshes.forEach((mesh, i) => {
        const noise = new THREE.Vector3(simplex(i, t, 0) * 0.01, simplex(i, t, 100) * 0.01, simplex(i, t, 200) * 0.01);
        mesh.position.addScaledVector(noise, selectedNodeRef.current === i ? 0.05 : 1);
        const offset = mesh.position.clone().sub(centerGlobal);
        if (offset.length() > margin) mesh.position.copy(centerGlobal.clone().add(offset.setLength(margin)));
      });
      orbiters.forEach((orb) => {
        orb.angle += orb.speed;
        orb.mesh.position.set(orb.radius * Math.cos(orb.angle), 0, orb.radius * Math.sin(orb.angle));
      });
      let idx = 0;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const start = nodeMeshes[i].position;
          const end = nodeMeshes[j].position;
          const mid = start.clone().lerp(end, 0.5).lerp(centerOfMass, 0.3);
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          (edges[idx++].line.geometry as THREE.BufferGeometry).setFromPoints(curve.getPoints(40));
        }
      }
      if (transitionFnRef.current) {
        const done = transitionFnRef.current(performance.now());
        if (done) {
          transitionFnRef.current = null;
          setCameraTransitioning(false);
          setInfoVisible(selectedNodeRef.current !== null);
          setTimeout(() => setInfoOpacity(1), 20);
        }
      }
      if (selectedNodeRef.current !== null && nodeInfoRef.current && cameraRef.current) {
        const mesh = nodeMeshes[selectedNodeRef.current];
        const vector = mesh.position.clone().project(camera);
        const newScreenX = ((vector.x + 1) / 2) * renderer.domElement.clientWidth;
        const newScreenY = ((1 - vector.y) / 2) * renderer.domElement.clientHeight;
        const dist = camera.position.distanceTo(mesh.position);
        const fovRad = (camera.fov * Math.PI) / 180;
        const visibleHeight = 2 * Math.tan(fovRad / 2) * dist;
        const scaleFactor = 2;
        const newBoxSize = (nodeSizeRelation * renderer.domElement.clientHeight * scaleFactor) / visibleHeight;
        newBoxSizeRef.current = newBoxSize;
        newScreenPos.current.x = newScreenX;
        newScreenPos.current.y = newScreenY;
        if (nodeInfoRef.current) {
          const fontSize = newBoxSize * 0.15;
          nodeInfoRef.current.style.width = `${newBoxSize}px`;
          nodeInfoRef.current.style.height = `${newBoxSize}px`;
          nodeInfoRef.current.style.transform = `translate(-50%, -50%) translate(${newScreenX}px, ${newScreenY}px)`;
          nodeInfoRef.current.style.fontSize = `${fontSize}px`;
        }
      }

      if (landmarksRef.current && cursorPosRef.current) {
  const cursorPos = updateCursorPos(landmarksRef, cursorPosRef);
  const targetPos = getClosestNode(cursorPos, nodePositions2DRef.current, 200);

  // Mover el cursor (si existe)
  if (cursorPos && cursorUIRef.current) {
    cursorUIRef.current.style.transform = `translate(-50%, -50%) translate(${cursorPos.x}px, ${cursorPos.y}px)`;
  }

  if (targetUIRef.current) {
    if (targetPos && cameraRef.current) {
      const mesh = nodeMeshesRef.current[targetPos.index];
      const dist = cameraRef.current.position.distanceTo(mesh.position);
      const fovRad = (cameraRef.current.fov * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(fovRad / 2) * dist;
      const scaleFactor = 2;
      const newTargetSize = (0.35 * renderer.domElement.clientHeight * scaleFactor) / visibleHeight;

      targetUIRef.current.style.width = `${newTargetSize}px`;
      targetUIRef.current.style.height = `${newTargetSize}px`;

      const previousTargetPos = targetUIRef.current.dataset.prevPos
        ? JSON.parse(targetUIRef.current.dataset.prevPos)
        : cursorPos;

      const smoothPos = {
        x: previousTargetPos.x + (targetPos.position.x - previousTargetPos.x) * 0.1,
        y: previousTargetPos.y + (targetPos.position.y - previousTargetPos.y) * 0.1,
      };

      targetUIRef.current.dataset.prevPos = JSON.stringify(smoothPos);

      targetUIRef.current.style.transform = `translate(-50%, -50%) translate(${smoothPos.x}px, ${smoothPos.y}px)`;
      targetUIRef.current.style.opacity = "1"; // mostrar

    } else {
      targetUIRef.current.style.opacity = "0";
    }
  }
}


      nodePositions2DRef.current = nodeMeshes.map((mesh) => {
        const vector = mesh.position.clone().project(camera);
        return {
          x_: ((vector.x + 1) / 2) * renderer.domElement.clientWidth,
          y_: ((1 - vector.y) / 2) * renderer.domElement.clientHeight,
        };
      });
      controls.update();
      renderer.render(scene, camera);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener("resize", onWindowResize);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("dblclick", onDoubleClick);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry?.dispose();
          if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose());
          else object.material?.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!handTrackingEnabled) return;
    if (!cameraRef.current || !controlsRef.current || nodeMeshesRef.current.length === 0) return;
    if (isClicking && closestNodeIndex !== null && !clickConsumedRef.current) {
      const selectionDeps = {
        nodeMeshes: nodeMeshesRef.current,
        camera: cameraRef.current,
        controls: controlsRef.current,
        centerGlobal: new THREE.Vector3(0, 0, 0),
        cameraDistance: 1,
        cameraOffsetBack: 6,
        transitionDurationMs: 800,
        selectedNodeRef,
        setSelectedNode,
        setCameraTransitioning,
        setInfoVisible,
        setInfoOpacity,
        transitionFnRef,
        scanTimeoutRef,
      };
      handleNodeSelection(closestNodeIndex.current, selectionDeps);
      clickConsumedRef.current = true;
    } else if (!isClicking) clickConsumedRef.current = false;
  }, [isClicking, closestNodeIndex, handTrackingEnabled]);

  return (
    <div ref={mountRef} style={{ width: "100vw", height: "100vh", background: "black", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 60,
          height: 30,
          borderRadius: 30,
          background: handTrackingEnabled ? "rgba(100,100,100,0.7)" : "rgba(50,50,50,0.4)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: 3,
          transition: "background 0.3s",
        }}
        onClick={() => setHandTrackingEnabled((prev) => !prev)}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "white",
            transform: handTrackingEnabled ? "translateX(30px)" : "translateX(0px)",
            transition: "transform 0.3s",
          }}
        />
      </div>
      {selectedNode !== null && nodeMeshesRef.current[selectedNode] && (
        <NodeInfoPanels
          ref={nodeInfoRef}
          mesh={nodeMeshesRef.current[selectedNode]}
          infoOpacity={infoOpacity}
          infoVisible={infoVisible}
        />
      )}
      {handTrackingEnabled && (
        <>

          <CursorHandTrack
            ref={cursorUIRef}
            boxSize={25}
          />
          <TargetHandTrack
            ref={targetUIRef}
          />

        </>
      )}
    </div>
  );
}
