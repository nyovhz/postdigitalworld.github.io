import * as THREE from "three";
import { createNoise3D } from "simplex-noise";
import { baseMaterial } from "./materials";
import { nodesData} from "./nodesData";

export interface GraphNode {
  id: number;
  name: string;
  link?: string;
  description?: string;
  position: THREE.Vector3;
  basePosition: THREE.Vector3;
}

export interface Edge {
  line: THREE.Line;
  start: GraphNode;
  end: GraphNode;
}

export const useNodesAndEdges = (
  placementRadius = 0.2,
  nodeRadius = 0.25
) => {
  const nodes: GraphNode[] = [];
  const nodeMeshes: THREE.Mesh[] = [];
  const edges: Edge[] = [];
  const nodeGeometry = new THREE.SphereGeometry(nodeRadius, 32, 32);
  const simplex = createNoise3D();

  for (const data of nodesData) {
    const pos = new THREE.Vector3(
      Math.random() * placementRadius - placementRadius / 2,
      Math.random() * placementRadius - placementRadius / 2,
      Math.random() * placementRadius - placementRadius / 2
    );

    const node: GraphNode = {
      id: data.id,
      name: data.name,
      link: data.link,
      description: data.description,
      position: pos.clone(),
      basePosition: pos.clone(),
    };

    nodes.push(node);

    const mesh = new THREE.Mesh(nodeGeometry, baseMaterial);
    mesh.position.copy(pos);
    mesh.userData = { id: data.id, name: data.name, link: data.link, description: data.description };
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    nodeMeshes.push(mesh);
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const startNode = nodes[i];
      const endNode = nodes[j];
      const center = new THREE.Vector3(0, 0, 0);
      const startOffset = center.clone().sub(startNode.position).normalize().multiplyScalar(nodeRadius);
      const endOffset = center.clone().sub(endNode.position).normalize().multiplyScalar(nodeRadius);

      const start = startNode.position.clone().add(startOffset);
      const end = endNode.position.clone().add(endOffset);

      const mid = start.clone().lerp(end, 0.5);
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(40);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x333333 }));

      edges.push({ line, start: startNode, end: endNode });
    }
  }

  return { nodes, nodeMeshes, edges, nodeGeometry, simplex };
};
