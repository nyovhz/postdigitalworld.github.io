"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useNodesAndEdges, getOppositeNormalFromEdge } from "./useNodesAndEdges";
import { useSceneSetup } from "./useSceneSetup";
import { transitionCamera } from "./useCameraTransition";

export default function Graph3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [cameraTransitioning, setCameraTransitioning] = useState(false);
  const [screenPos, setScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [infoOpacity, setInfoOpacity] = useState(0);
  const [infoVisible, setInfoVisible] = useState(false);

  const selectedNodeRef = useRef<number | null>(null);
  const nodeMeshesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const cameraDistance = 1;
    const cameraOffsetBack = 7;
    const transitionDurationMs = 800;

    const { scene, camera, renderer, controls } = useSceneSetup(mountRef)!;
    const { nodes, nodeMeshes, edges, simplex } = useNodesAndEdges(10, 8, 0.35);

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

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    // --- Click para seleccionar nodo ---
    const onClick = async (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshesRef.current);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        const id = mesh.userData.id as number;

        setInfoOpacity(0);
        setInfoVisible(false);
        setSelectedNode(id);
        selectedNodeRef.current = id;
        setCameraTransitioning(true);

        nodeMeshesRef.current.forEach((m, i) => {
          (m.material as THREE.MeshStandardMaterial).color.set(i === id ? 0x797979 : 0x000000);
        });

        const startPoint = mesh.position
          .clone()
          .add(centerGlobal.clone().sub(mesh.position).normalize().multiplyScalar(0.35));
        const opp = getOppositeNormalFromEdge(startPoint, cameraDistance);
        const camTarget = startPoint.clone().add(opp.dir.clone().normalize().multiplyScalar(-cameraOffsetBack));

        transitionCamera(camera, controls, camTarget, mesh.position, transitionDurationMs);
        await sleep(transitionDurationMs);

        setCameraTransitioning(false);
        setInfoVisible(true);
        setTimeout(() => setInfoOpacity(1), 20);
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    // --- Hover con efecto visual (glow) y cursor ---
    let hoveredNode: THREE.Mesh | null = null;
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshesRef.current);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        renderer.domElement.style.cursor = "pointer";

        if (hoveredNode !== mesh) {
          if (hoveredNode) {
            (hoveredNode.material as THREE.MeshStandardMaterial).emissive.set(0x000000);
          }
          hoveredNode = mesh;
          (mesh.material as THREE.MeshStandardMaterial).emissive.set(0x3333ff); // glow azul suave
        }
      } else {
        if (hoveredNode) {
          (hoveredNode.material as THREE.MeshStandardMaterial).emissive.set(0x000000);
          hoveredNode = null;
        }
        renderer.domElement.style.cursor = "default";
      }
    };
    renderer.domElement.addEventListener("mousemove", onMouseMove);

    // --- Animación principal ---
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime() * 0.2;

      nodeMeshes.forEach((mesh, i) => {
        const noise = new THREE.Vector3(
          simplex(i, t, 0) * 0.01,
          simplex(i, t, 100) * 0.01,
          simplex(i, t, 200) * 0.01
        );
        mesh.position.add(velocities[i]).add(noise);

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
            nodeMeshes[i].position.add(push.clone().multiplyScalar(-1));
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

      if (selectedNodeRef.current !== null && !cameraTransitioning) {
        const mesh = nodeMeshes[selectedNodeRef.current];

        // Usa la posición central real
        const camPos = mesh.position.clone().add(
          getOppositeNormalFromEdge(mesh.position, cameraDistance).dir.clone().multiplyScalar(-cameraOffsetBack)
        );

        camera.position.lerp(camPos, 0.05);
        controls.target.lerp(mesh.position, 0.05);
        camera.lookAt(mesh.position);

        // Proyectar la posición real del nodo
        const vector = mesh.position.clone().project(camera);
        const screenX = ((vector.x + 1) / 2) * renderer.domElement.clientWidth;
        const screenY = ((1 - (vector.y + 1) / 2)) * renderer.domElement.clientHeight;
        setScreenPos({ x: screenX, y: screenY });
      }


      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // cleanup
    return () => {
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (cameraTransitioning) {
      setInfoOpacity(0);
    } else {
      if (infoVisible) {
        const to = setTimeout(() => setInfoOpacity(1), 20);
        return () => clearTimeout(to);
      } else {
        setInfoOpacity(0);
      }
    }
  }, [cameraTransitioning, infoVisible]);

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

        const boxSize = 100;
        const gap = 60;

        return (
          <>
            <div
              style={{
                position: "absolute",
                left: screenPos.x - boxSize / 2,
                top: screenPos.y - boxSize / 2,
                width: boxSize,
                height: boxSize,
                border: "2px solid blue",
                pointerEvents: "none",
                opacity: infoOpacity,
                transition: "opacity 0.6s ease-in-out",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: screenPos.x + gap,
                top: screenPos.y - boxSize / 2,
                width: boxSize,
                height: boxSize,
                color: "white",
                background: "rgba(0,0,0,0.7)",
                padding: "8px",
                borderRadius: "6px",
                fontSize: "13px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "none",
                opacity: infoOpacity,
                transition: "opacity 0.6s ease-in-out",
              }}
            >
              <ul style={{ margin: 0, padding: 0, listStyle: "none", textAlign: "left" }}>
                <li><strong>ID:</strong> {mesh.userData.id}</li>
                <li><strong>Name:</strong> {mesh.userData.name ?? "N/A"}</li>
                <li style={{ marginTop: 6 }}>
                  x: {mesh.position.x.toFixed(2)}<br />
                  y: {mesh.position.y.toFixed(2)}<br />
                  z: {mesh.position.z.toFixed(2)}
                </li>
              </ul>
            </div>
          </>
        );
      })()}
    </div>
  );
}
