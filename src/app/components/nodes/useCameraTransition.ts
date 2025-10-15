"use client";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export const transitionCamera = (
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  targetPosition: THREE.Vector3,
  lookAtPosition: THREE.Vector3,
  duration = 1000
): Promise<void> => {
  return new Promise((resolve) => {
    const startPos = camera.position.clone();
    const targetPos = targetPosition.clone();
    const startTarget = controls.target.clone();
    const endTarget = lookAtPosition.clone();
    const startTime = performance.now();

    // easing in-out cubic
    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (time: number) => {
      const t = Math.min((time - startTime) / duration, 1);
      const ease = easeInOut(t);

      camera.position.lerpVectors(startPos, targetPos, ease);
      controls.target.lerpVectors(startTarget, endTarget, ease);
      camera.lookAt(controls.target);

      controls.update();

      if (t < 1) requestAnimationFrame(animate);
      else {
        controls.target.copy(endTarget);
        camera.position.copy(targetPos);
        camera.lookAt(endTarget);
        controls.update();
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
};
