export function getClosestNode(
  cursorPos: { x: number; y: number } | undefined | null,
  nodeProximity: Array<{ x_: number; y_: number }> | null | undefined,
  suggestDistance: number
): { index: number; position: { x: number; y: number } } | null {
  if (!cursorPos || !nodeProximity || nodeProximity.length === 0 || suggestDistance <= 0) {
    return null;
  }

  let closestIndex: number | null = null;
  let closestPos: { x: number; y: number } | null = null;
  let minDistance = suggestDistance;

  nodeProximity.forEach((node, i) => {
    if (!node || typeof node.x_ !== "number" || typeof node.y_ !== "number") return;

    const dx = node.x_ - cursorPos.x;
    const dy = node.y_ - cursorPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= minDistance) {
      minDistance = distance;
      closestIndex = i;
      closestPos = { x: node.x_, y: node.y_ };
    }
  });

  if (closestIndex === null || closestPos === null) return null;

  return { index: closestIndex, position: closestPos };
}
