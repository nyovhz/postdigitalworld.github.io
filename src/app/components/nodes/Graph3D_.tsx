"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useNodesAndEdges } from "./useNodesAndEdges";
import { useSceneSetup } from "./useSceneSetup";
import { useGraphEvents, getOppositeNormalFromEdge } from "./useGraphEvents";
import { setupPostProcessing } from "./usePostProcessing";
import { NodeInfoPanels } from "./nodeInfoPanels";

export default function Graph3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [cameraTransitioning, setCameraTransitioning] = useState(false);
  const [screenPos, setScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [boxSize, setBoxSize] = useState<number>(500);
  const [infoOpacity, setInfoOpacity] = useState(0);
  const [infoVisible, setInfoVisible] = useState(false);

  const selectedNodeRef = useRef<number | null>(null);
  const nodeMeshesRef = useRef<THREE.Mesh[]>([]);
  const transitionFnRef = useRef<((now: number) => boolean) | null>(null);

  const baseBoxSize = 700;
  const baseGap = 400;
  const baseFontSize = 90;

  useEffect(() => {
    if (!mountRef.current) return;

    const cameraDistance = 1;
    const cameraOffsetBack = 6;
    const transitionDurationMs = 800;

    const { scene, camera, renderer, controls, InitialCameraPos } = useSceneSetup(mountRef)!;
    const { nodes, nodeMeshes, edges, simplex } = useNodesAndEdges(8, 0.35);
    const composer = setupPostProcessing(renderer, scene, camera, {
      fxaa: true,
      motionBlur: true,
      film: true,
      filmIntensity: 0.5,
      gammaCorrection: true,
    });

    nodeMeshesRef.current = nodeMeshes;
    nodeMeshes.forEach((m) => scene.add(m));
    edges.forEach((e) => scene.add(e.line));

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const centerGlobal = new THREE.Vector3(0, 0, 0);
    const maxRadius = 6;

    const velocities = nodes.map(
      () =>
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.002
        )
    );

    const { onClick, onDoubleClick, onMouseMove } = useGraphEvents({
      camera,
      controls,
      nodeMeshes: nodeMeshesRef.current,
      raycaster,
      mouse,
      centerGlobal,
      InitialCameraPos,
      cameraDistance,
      cameraOffsetBack,
      transitionDurationMs,
      selectedNodeRef,
      setSelectedNode,
      setCameraTransitioning,
      setInfoVisible,
      setInfoOpacity,
      transitionFnRef,
    });

    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("dblclick", onDoubleClick);
    renderer.domElement.addEventListener("mousemove", onMouseMove);

    const clock = new THREE.Clock();
    const animate = (now: number) => {
      const t = clock.getElapsedTime() * 0.2;

      nodeMeshes.forEach((mesh, i) => {
        const noise = new THREE.Vector3(
          simplex(i, t, 0) * 0.01,
          simplex(i, t, 100) * 0.01,
          simplex(i, t, 200) * 0.01
        );

        const velocityMultiplier =
          selectedNodeRef.current === i ? 0.05 : 1; 

        mesh.position.addScaledVector(velocities[i], velocityMultiplier).addScaledVector(noise, velocityMultiplier);

        const dir = mesh.position.clone().sub(centerGlobal);
        if (dir.length() > maxRadius) {
          velocities[i].multiplyScalar(-1);
          mesh.position.copy(centerGlobal.clone().add(dir.normalize().multiplyScalar(maxRadius)));
        }
      });


      const minDistance = 0.7;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dir = nodeMeshes[j].position.clone().sub(nodeMeshes[i].position);
          const dist = dir.length();
          if (dist < minDistance) {
            const push = dir.normalize().multiplyScalar((minDistance - dist) / 2);
            nodeMeshes[i].position.addScaledVector(push, -1);
            nodeMeshes[j].position.add(push);
          }
        }
      }

      const centerOfMass = new THREE.Vector3();
      nodeMeshes.forEach((m) => centerOfMass.add(m.position));
      centerOfMass.divideScalar(nodeMeshes.length);

      let idx = 0;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const start = nodeMeshes[i].position
            .clone()
            .add(centerGlobal.clone().sub(nodeMeshes[i].position).normalize().multiplyScalar(0.35));
          const end = nodeMeshes[j].position
            .clone()
            .add(centerGlobal.clone().sub(nodeMeshes[j].position).normalize().multiplyScalar(0.35));
          const mid = start.clone().lerp(end, 0.5).lerp(centerOfMass, 0.3);
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const points = curve.getPoints(40);
          (edges[idx++].line.geometry as THREE.BufferGeometry).setFromPoints(points);
        }
      }

      if (transitionFnRef.current) {
        const done = transitionFnRef.current(now);
        if (done) {
          transitionFnRef.current = null;
          setCameraTransitioning(false);
          setInfoVisible(selectedNodeRef.current !== null);
          setTimeout(() => setInfoOpacity(1), 20);
        }
      }

      if (selectedNodeRef.current !== null && !cameraTransitioning) {
        const mesh = nodeMeshes[selectedNodeRef.current];
        const vector = mesh.position.clone().project(camera);
        const screenX = ((vector.x + 1) / 2) * renderer.domElement.clientWidth;
        const screenY = ((1 - (vector.y + 1) / 2)) * renderer.domElement.clientHeight;
        setScreenPos({ x: screenX, y: screenY });

        const distToCamera = mesh.position.distanceTo(camera.position);
        const scaledSize = baseBoxSize / distToCamera;
        setBoxSize(scaledSize);
      }

      controls.update();
      composer.render();
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    return () => {
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {selectedNode !== null && screenPos && infoVisible && (() => {
        const mesh = nodeMeshesRef.current[selectedNode];
        if (!mesh) return null;

        return (
          <NodeInfoPanels
            mesh={mesh}
            screenPos={screenPos}
            boxSize={boxSize}
            baseBoxSize={baseBoxSize}
            baseGap={baseGap}
            baseFontSize={baseFontSize}
            infoOpacity={infoOpacity}
            infoVisible={infoVisible}
          />
        );
      })()}

    </div>

  );
}
