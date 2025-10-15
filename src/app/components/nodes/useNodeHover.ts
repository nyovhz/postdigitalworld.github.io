"use client";
import { useEffect } from "react";
import * as THREE from "three";

interface UseNodeHoverProps {
  nodeMeshes: THREE.Mesh[];
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  onHover?: (nodeId: number, position: THREE.Vector3) => void;
}

export const useNodeHover = ({ nodeMeshes, camera, renderer, onHover }: UseNodeHoverProps) => {
  useEffect(() => {
    if (!renderer || !camera || !nodeMeshes.length) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const mesh = intersects[0].object as THREE.Mesh;
        if (onHover) onHover(mesh.userData.id, mesh.position.clone());
      }
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    return () => {
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
    };
  }, [nodeMeshes, camera, renderer, onHover]);
};
