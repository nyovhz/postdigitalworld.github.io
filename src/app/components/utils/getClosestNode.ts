export function getClosestNodeIndex(
  cursorPos: { x: number; y: number } | undefined,
  nodeProximity: { x_: number; y_: number }[],
  suggestDistance: number
): number | null {
  if (!cursorPos || nodeProximity.length === 0) return null;

  let closestIndex: number | null = null;
  let minDistance = suggestDistance;

  nodeProximity.forEach((node, i) => {
    const dx = node.x_ - cursorPos.x;
    const dy = node.y_ - cursorPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance <= minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  });

  return closestIndex;
}
