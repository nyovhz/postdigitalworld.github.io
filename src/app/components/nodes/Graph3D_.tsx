"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useNodesAndEdges } from "./useNodesAndEdges";
import { useSceneSetup } from "./useSceneSetup";
import { useGraphEvents } from "./useGraphEvents";
import { setupPostProcessing } from "./usePostProcessing";
import { NodeInfoPanels } from "./nodeInfoPanels";
import { scanMaterial } from "./materials";

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

  const baseBoxSize = 750;
  const baseGap = 400;
  const baseFontSize = 90;

  useEffect(() => {
    if (!mountRef.current) return;

    const cameraDistance = 1;
    const cameraOffsetBack = 5;
    const transitionDurationMs = 800;
    const nodeSizeRelation = 0.35;

    const { scene, camera, renderer, controls, InitialCameraPos } = useSceneSetup(mountRef)!;
    const { nodes, nodeMeshes, edges, simplex, orbiters } = useNodesAndEdges(8, nodeSizeRelation);
    const { composer, bokehPass } = setupPostProcessing(renderer, scene, camera, {
      depthOfField: true,
      focus: 4,
      maxblur: 0.016,
      aperture: 0.001,
      fxaa: true,
      motionBlur: true,
      film: true,
      filmIntensity: 0.3,
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
      bokehPass,
    });

    window.addEventListener("resize", () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });


    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("dblclick", onDoubleClick);
    renderer.domElement.addEventListener("mousemove", onMouseMove);

    const clock = new THREE.Clock();

    const animate = (now: number) => {
      const t = clock.getElapsedTime() * 0.2;
      scanMaterial.uniforms.time.value = performance.now() / 1000;

      // Actualizar nodos
      nodeMeshes.forEach((mesh, i) => {
        const noise = new THREE.Vector3(
          simplex(i, t, 0) * 0.01,
          simplex(i, t, 100) * 0.01,
          simplex(i, t, 200) * 0.01
        );
        const noiseMultiplier = selectedNodeRef.current === i ? 0.05 : 1;
        mesh.position.addScaledVector(noise, noiseMultiplier);
      });

      // Actualizar orbiters
      orbiters.forEach((orb) => {
        orb.angle += orb.speed;
        orb.mesh.position.set(
          orb.radius * Math.cos(orb.angle),
          0,
          orb.radius * Math.sin(orb.angle)
        );
      });


      // Separación mínima
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

      // Actualizar líneas
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

      // Actualizar cámara, bokeh y info panels
      if (transitionFnRef.current) {
        const done = transitionFnRef.current(now);
        if (done) {
          transitionFnRef.current = null;
          setCameraTransitioning(false);
          setInfoVisible(selectedNodeRef.current !== null);
          setTimeout(() => setInfoOpacity(1), 20);
        }
      }

      if (bokehPass) {
        const focusUniform = bokehPass.materialBokeh.uniforms["focus"];
        const maxBlurUniform = bokehPass.materialBokeh.uniforms["maxblur"];
        const focusLerpSpeed = 0.1;
        const blurLerpSpeed = 0.05;

        let targetFocus: number;
        let targetMaxBlur: number;

        if (selectedNodeRef.current !== null) {
          const mesh = nodeMeshes[selectedNodeRef.current];
          const dist = camera.position.distanceTo(mesh.position);
          targetFocus = dist;
          targetMaxBlur = 0.005;

          const vector = mesh.position.clone().project(camera);
          const screenX = ((vector.x + 1) / 2) * renderer.domElement.clientWidth;
          const screenY = ((1 - (vector.y + 1) / 2)) * renderer.domElement.clientHeight;
          setScreenPos({ x: screenX, y: screenY });

          const fovRad = (camera.fov * Math.PI) / 180;
          const projectedHeight = 2 * dist * Math.tan(fovRad / 2);
          const visibleRatio = nodeSizeRelation * 2 / projectedHeight;
          const scaledSize = visibleRatio * renderer.domElement.clientHeight;
          setBoxSize(scaledSize);
        } else {
          targetFocus = camera.position.distanceTo(centerGlobal);
          targetMaxBlur = 0;
        }

        focusUniform.value = THREE.MathUtils.lerp(focusUniform.value, targetFocus, focusLerpSpeed);
        maxBlurUniform.value = THREE.MathUtils.lerp(maxBlurUniform.value, targetMaxBlur, blurLerpSpeed);
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
