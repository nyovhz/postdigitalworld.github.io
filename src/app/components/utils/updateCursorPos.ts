import { MutableRefObject } from "react";

// cursorPosRef se mantiene entre frames
export function updateCursorPos(
  landmarksRef: MutableRefObject<any[]>,
  cursorPosRef: MutableRefObject<{ x: number; y: number }>,
  lerpFactor = 0.08
): { x: number; y: number } | null {
  const hands = landmarksRef.current;
  const cursorPos = cursorPosRef.current;

  if (!hands || hands.length === 0) return null;

  const indexTip = hands[0][8];
  const targetX = (1 - indexTip.x) * window.innerWidth;
  const targetY = indexTip.y * window.innerHeight;

  // Suavizado (lerp)
  cursorPos.x += (targetX - cursorPos.x) * lerpFactor;
  cursorPos.y += (targetY - cursorPos.y) * lerpFactor;

  return cursorPos;
}
