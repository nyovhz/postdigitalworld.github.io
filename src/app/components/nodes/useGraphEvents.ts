// useGraphEvents.ts
import * as THREE from "three";
import { createCameraTransition } from "./useCameraTransition";
import { baseMaterial, selectedMaterial, hoverMaterial, scanMaterial } from "./materials";

type UseGraphEventsParams = {
    camera: THREE.PerspectiveCamera;
    controls: any;
    nodeMeshes: THREE.Mesh[];
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    centerGlobal: THREE.Vector3;
    InitialCameraPos: THREE.Vector3;
    cameraDistance: number;
    cameraOffsetBack: number;
    transitionDurationMs: number;
    selectedNodeRef: React.MutableRefObject<number | null>;
    setSelectedNode: (id: number | null) => void;
    setCameraTransitioning: (b: boolean) => void;
    setInfoVisible: (b: boolean) => void;
    setInfoOpacity: (b: number) => void;
    transitionFnRef: React.MutableRefObject<((now: number) => boolean) | null>;
};

export const useGraphEvents = ({
    camera,
    controls,
    nodeMeshes,
    raycaster,
    mouse,
    centerGlobal,
    InitialCameraPos,
    cameraDistance,
    cameraOffsetBack,
    transitionDurationMs,
    selectedNodeRef,
    setSelectedNode,
    setCameraTransitioning,
    setInfoVisible,
    setInfoOpacity,
    transitionFnRef,
}: UseGraphEventsParams) => {
    let hoveredNode: THREE.Mesh | null = null;

    const onClick = (event: MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(nodeMeshes);
        if (intersects.length > 0) {
            const mesh = intersects[0].object as THREE.Mesh;
            const id = mesh.userData.id as number;

            setInfoOpacity(0);
            setInfoVisible(false);
            setSelectedNode(id);
            selectedNodeRef.current = id;
            setCameraTransitioning(true);

            // 1️⃣ Cambiar inmediatamente a scanMaterial
            nodeMeshes.forEach((m, i) => {
                m.material = i === id ? scanMaterial : baseMaterial;
            });

            // 2️⃣ Después de 2 segundos, cambiar a selectedMaterial
            setTimeout(() => {
                nodeMeshes.forEach((m, i) => {
                    m.material = i === id ? selectedMaterial : baseMaterial;
                });
            }, 3000);

            const startPoint = mesh.position
                .clone()
                .add(centerGlobal.clone().sub(mesh.position).normalize().multiplyScalar(0.35));
            const opp = getOppositeNormalFromEdge(startPoint, cameraDistance);
            const camTarget = startPoint.clone().add(opp.dir.clone().normalize().multiplyScalar(-cameraOffsetBack));

            transitionFnRef.current = createCameraTransition(camera, controls, camTarget, mesh.position, transitionDurationMs);
        }
    };


    const onDoubleClick = (event: MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(nodeMeshes);
        if (intersects.length === 0) {
            setInfoVisible(false);
            setInfoOpacity(0);

            nodeMeshes.forEach((m) => (m.material = baseMaterial));

            setSelectedNode(null);
            selectedNodeRef.current = null;

            setCameraTransitioning(true);
            transitionFnRef.current = createCameraTransition(camera, controls, InitialCameraPos, centerGlobal, transitionDurationMs);
        }
    };

    const onMouseMove = (event: MouseEvent) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(nodeMeshes);
        if (intersects.length > 0) {
            const mesh = intersects[0].object as THREE.Mesh;
            (event.target as HTMLElement).style.cursor = "pointer";

            if (hoveredNode !== mesh) {
                if (hoveredNode && selectedNodeRef.current !== hoveredNode.userData.id) {
                    hoveredNode.material = baseMaterial;
                }

                hoveredNode = mesh;
                if (selectedNodeRef.current !== mesh.userData.id) {
                    hoveredNode.material = hoverMaterial;
                }
            }
        } else {
            if (hoveredNode && selectedNodeRef.current !== hoveredNode.userData.id) {
                hoveredNode.material = baseMaterial;
            }
            hoveredNode = null;
            (event.target as HTMLElement).style.cursor = "default";
        }
    };

    return { onClick, onDoubleClick, onMouseMove };
};

export function getOppositeNormalFromEdge(startPoint: THREE.Vector3, length = 1) {
    const centerGlobal = new THREE.Vector3(0, 0, 0);
    const dirToCenter = centerGlobal.clone().sub(startPoint).normalize();
    const oppDir = dirToCenter.clone().multiplyScalar(length);
    return { start: startPoint.clone(), dir: oppDir };
}
