import { useEffect, useRef, useState } from "react";

interface LerpPosition {
  x: number;
  y: number;
}

interface UseLerpProps {
  from: LerpPosition;
  to: LerpPosition;
  lerpFactor?: number; // default 0.1
}

export function useLerp(from: { x: number; y: number }, to: { x: number; y: number }, factor: number) {
  return {
    x: from.x + (to.x - from.x) * factor,
    y: from.y + (to.y - from.y) * factor,
  };
}

