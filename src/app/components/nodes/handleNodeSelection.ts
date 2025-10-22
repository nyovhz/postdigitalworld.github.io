import * as THREE from "three";
import { createCameraTransition } from "./useCameraTransition";
import { baseMaterial, selectedMaterial, scanMaterial } from "./materials";
import { getOppositeNormalFromEdge } from "./useGraphEvents";

export type HandleNodeSelectionDeps = {
  nodeMeshes: THREE.Mesh[];
  camera: THREE.PerspectiveCamera;
  controls: any;
  centerGlobal: THREE.Vector3;
  cameraDistance: number;
  cameraOffsetBack: number;
  transitionDurationMs: number;
  selectedNodeRef: React.MutableRefObject<number | null>;
  setSelectedNode: (id: number | null) => void;
  setCameraTransitioning: (b: boolean) => void;
  setInfoVisible: (b: boolean) => void;
  setInfoOpacity: (n: number) => void;
  transitionFnRef: React.MutableRefObject<((now: number) => boolean) | null>;
  scanTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
};

export function handleNodeSelection(id: number, deps: HandleNodeSelectionDeps) {
  const {
    nodeMeshes,
    camera,
    controls,
    centerGlobal,
    cameraDistance,
    cameraOffsetBack,
    transitionDurationMs,
    selectedNodeRef,
    setSelectedNode,
    setCameraTransitioning,
    setInfoVisible,
    setInfoOpacity,
    transitionFnRef,
    scanTimeoutRef,
  } = deps;

  const mesh = nodeMeshes[id];
  if (!mesh) return;

  setInfoOpacity(0);
  setInfoVisible(false);
  setSelectedNode(id);
  selectedNodeRef.current = id;
  setCameraTransitioning(true);

  nodeMeshes.forEach((m, i) => {
    m.material = i === id ? scanMaterial : baseMaterial;
  });

  if (scanTimeoutRef.current) {
    clearTimeout(scanTimeoutRef.current);
    scanTimeoutRef.current = null;
  }

  scanTimeoutRef.current = setTimeout(() => {
    nodeMeshes.forEach((m, i) => {
      m.material = i === id ? selectedMaterial : baseMaterial;
    });
    scanTimeoutRef.current = null;
  }, 2000);

  const startPoint = mesh.position
    .clone()
    .add(centerGlobal.clone().sub(mesh.position).normalize().multiplyScalar(0.35));
  const opp = getOppositeNormalFromEdge(startPoint, cameraDistance);
  const camTarget = startPoint.clone().add(opp.dir.clone().normalize().multiplyScalar(-cameraOffsetBack));

  transitionFnRef.current = createCameraTransition(
    camera,
    controls,
    camTarget,
    mesh.position,
    transitionDurationMs
  );
}
