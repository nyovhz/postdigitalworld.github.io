// useNodeScreenPositions.ts
import { useEffect, useRef } from "react";
import * as THREE from "three";

export function useNodeScreenPositions(nodeMeshes, camera) {
  const nodePositions2DRef = useRef<{ x_: number; y_: number }[]>([]);

  useEffect(() => {
    nodePositions2DRef.current = nodeMeshes.map(mesh => {
      const vector = mesh.position.clone().project(camera);
      return {
        x_: ((vector.x + 1) / 2) * window.innerWidth,
        y_: ((1 - vector.y) / 2) * window.innerHeight,
      };
    });
  });

  return nodePositions2DRef;
}
