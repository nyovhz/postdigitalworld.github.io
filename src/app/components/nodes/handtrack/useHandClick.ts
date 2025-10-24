export function useHandClick(
  landmarks: Array<Array<{ x: number; y: number; z: number }>>,
  threshold = 0.05
): boolean {
  if (!landmarks || landmarks.length === 0) return false;

  const thumbTip = landmarks[0][4];
  const middleTip = landmarks[0][12];

  const dx = thumbTip.x - middleTip.x;
  const dy = thumbTip.y - middleTip.y;

  return Math.sqrt(dx * dx + dy * dy) < threshold;
}
