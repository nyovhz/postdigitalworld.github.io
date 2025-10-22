import * as THREE from "three";

export function useHandRaycaster(nodeMeshes: THREE.Object3D[], camera: THREE.Camera, handRef: React.RefObject<HTMLDivElement>) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const intersects: THREE.Intersection[] = [];

  const updateRaycast = () => {
    if (!camera || nodeMeshes.length === 0 || !handRef.current) return;

    const rect = handRef.current.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    intersects.length = 0;
    intersects.push(...raycaster.intersectObjects(nodeMeshes, true));

    return intersects;
  };

  return { raycaster, mouse, intersects, updateRaycast };
}
