import { useEffect, useRef, useState } from "react";

export function useHandCursor(
  landmarksRef: React.MutableRefObject<any[]>,
  nodePositions2D: { x_: number; y_: number }[],
  suggestDistance = 200,
  lerpFactor = 0.08
) {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [closestNodeIndex, setClosestNodeIndex] = useState<number | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  const smoothCursorRef = useRef({ x: 0, y: 0 });

  const nodePositionsRef = useRef(nodePositions2D);
  nodePositionsRef.current = nodePositions2D;

  useEffect(() => {
    let animationFrame: number;

    const updateCursor = () => {
      const hands = landmarksRef.current;
      const nodes = nodePositionsRef.current;

      if (hands.length > 0 && nodes.length > 0) {
        const indexTip = hands[0][8];
        const thumbTip = hands[0][4];
        const middleTip = hands[0][12];

        const targetX = (1 - indexTip.x) * window.innerWidth;
        const targetY = indexTip.y * window.innerHeight;

        smoothCursorRef.current.x += (targetX - smoothCursorRef.current.x) * lerpFactor;
        smoothCursorRef.current.y += (targetY - smoothCursorRef.current.y) * lerpFactor;

        setCursorPos({ ...smoothCursorRef.current });

        const dx = thumbTip.x - middleTip.x;
        const dy = thumbTip.y - middleTip.y;
        setIsClicking(Math.sqrt(dx * dx + dy * dy) < 0.05);

        let closest: number | null = null;
        let minDist = suggestDistance;
        nodes.forEach((node, i) => {
          const dist = Math.hypot(node.x_ - targetX, node.y_ - targetY);
          if (dist <= minDist) {
            minDist = dist;
            closest = i;
          }
        });
        setClosestNodeIndex(closest);
      }

      animationFrame = requestAnimationFrame(updateCursor);
    };

    animationFrame = requestAnimationFrame(updateCursor);
    return () => cancelAnimationFrame(animationFrame);
  }, [suggestDistance, lerpFactor]);

  return { cursorPos, closestNodeIndex, isClicking };
}
