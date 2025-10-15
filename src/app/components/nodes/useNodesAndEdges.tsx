"use client";
import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

export interface GraphNode {
  id: number;
  position: THREE.Vector3;
  basePosition: THREE.Vector3;
}

export interface Edge {
  line: THREE.Line;
  start: GraphNode;
  end: GraphNode;
}

export const useNodesAndEdges = (
  nodeCount = 10,
  placementRadius = 8,
  nodeRadius = 0.35
) => {
  const nodes: GraphNode[] = [];
  const nodeMeshes: THREE.Mesh[] = [];
  const edges: Edge[] = [];
  const nodeGeometry = new THREE.SphereGeometry(nodeRadius, 32, 32);
  const simplex = createNoise3D();

  // Crear nodos
  for (let i = 0; i < nodeCount; i++) {
    const pos = new THREE.Vector3(
      Math.random() * placementRadius - placementRadius / 2,
      Math.random() * placementRadius - placementRadius / 2,
      Math.random() * placementRadius - placementRadius / 2
    );
    const node: GraphNode = { id: i, position: pos.clone(), basePosition: pos.clone() };
    nodes.push(node);

    const mesh = new THREE.Mesh(
      nodeGeometry,
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.3,
        roughness: 0.2,
      })
    );
    mesh.position.copy(pos);
    mesh.userData.id = i;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    nodeMeshes.push(mesh);
  }

  // Crear edges con offset en superficie de nodo
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      const startNode = nodes[i];
      const endNode = nodes[j];

      const center = new THREE.Vector3(0, 0, 0);
      const startOffset = center.clone().sub(startNode.position).normalize().multiplyScalar(nodeRadius);
      const endOffset = center.clone().sub(endNode.position).normalize().multiplyScalar(nodeRadius);

      const start = startNode.position.clone().add(startOffset);
      const end = endNode.position.clone().add(endOffset);

      // Midpoint inicial
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

// Normal exterior para cámara
export function getOutwardNormal(index: number, nodes: GraphNode[]): THREE.Vector3 {
  const current = nodes[index].position;
  const avg = new THREE.Vector3();
  nodes.forEach((n, i) => {
    if (i !== index) avg.add(n.position.clone().sub(current).normalize());
  });
  return avg.multiplyScalar(-1).normalize();
}

export function getOppositeNormalFromEdge(startPoint: THREE.Vector3, length = 1) {
  const centerGlobal = new THREE.Vector3(0, 0, 0);
  const dirToCenter = centerGlobal.clone().sub(startPoint).normalize();
  const oppDir = dirToCenter.clone().multiplyScalar(length);
  return { start: startPoint.clone(), dir: oppDir };
}



