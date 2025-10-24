import { useEffect, useRef, useState } from "react";

export function useHandCursor(
  landmarksRef: React.MutableRefObject<any[]>,
  nodePositions2D: { x_: number; y_: number }[],
  suggestDistance = 200,
  lerpFactor = 0.08
) {
  // 👇 ahora solo "isClicking" necesita causar renders
  const [isClicking, setIsClicking] = useState(false);

  const cursorPos = useRef({ x: 0, y: 0 });
  const closestNodeIndex = useRef<number | null>(null);

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

        // suavizado
        cursorPos.current.x += (targetX - cursorPos.current.x) * lerpFactor;
        cursorPos.current.y += (targetY - cursorPos.current.y) * lerpFactor;

        // clic (thumb–middle proximity)
        const dx = thumbTip.x - middleTip.x;
        const dy = thumbTip.y - middleTip.y;
        setIsClicking(Math.sqrt(dx * dx + dy * dy) < 0.05);

        // nodo más cercano (sin re-render)
        let closest: number | null = null;
        let minDist = suggestDistance;
        nodes.forEach((node, i) => {
          const dist = Math.hypot(node.x_ - targetX, node.y_ - targetY);
          if (dist <= minDist) {
            minDist = dist;
            closest = i;
          }
        });

        // 🔹 ahora se guarda en ref
        closestNodeIndex.current = closest;
      }

      animationFrame = requestAnimationFrame(updateCursor);
    };

    animationFrame = requestAnimationFrame(updateCursor);
    return () => cancelAnimationFrame(animationFrame);
  }, [suggestDistance, lerpFactor]);

  return { cursorPos, closestNodeIndex, isClicking };
}
