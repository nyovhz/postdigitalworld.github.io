"use client";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * Crea una transición suave de cámara, pero sin su propio requestAnimationFrame.
 * Devuelve una función que se llama cada frame con el tiempo actual y que
 * actualiza la cámara/controles hasta que termina.
 */
export const createCameraTransition = (
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  targetPos: THREE.Vector3,
  lookAtPos: THREE.Vector3,
  duration = 1000
) => {
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const endPos = targetPos.clone();
  const endTarget = lookAtPos.clone();
  const startTime = performance.now();

  const easeInOut = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  return (now: number) => {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = easeInOut(t);

    camera.position.lerpVectors(startPos, endPos, ease);
    controls.target.lerpVectors(startTarget, endTarget, ease);

    controls.update();
    const done = t >= 1;
    return done;
  };
};
