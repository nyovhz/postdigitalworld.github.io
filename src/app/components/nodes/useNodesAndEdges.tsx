import * as THREE from "three";
import { createNoise3D } from "simplex-noise";
import { baseMaterial, orbiterMaterial } from "./materials";
import { nodesData } from "./nodesData";

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

export interface Orbiter {
  mesh: THREE.Mesh;
  node: GraphNode;
  radius: number;
  speed: number;
  angle: number;
}

export const useNodesAndEdges = (placementRadius: number, nodeRadius: number) => {
  const nodes: GraphNode[] = [];
  const nodeMeshes: THREE.Mesh[] = [];
  const edges: Edge[] = [];
  const orbiters: Orbiter[] = [];
  const nodeGeometry = new THREE.SphereGeometry(nodeRadius, 32, 32);
  const simplex = createNoise3D();

  const orbiterGeometry = new THREE.SphereGeometry(0.04, 16, 16);

  for (const data of nodesData) {
    const pos = new THREE.Vector3(
      Math.random() * placementRadius - placementRadius / 2,
      Math.random() * placementRadius - placementRadius / 2,
      Math.random() * placementRadius - placementRadius / 2
    );

    const node: GraphNode = {
      id: data.id,
      name: data.name,
      link: data.link || undefined,
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

    // Orbiter solo si el nodo tiene link
    if (data.link) {
      const orbiterMesh = new THREE.Mesh(orbiterGeometry, orbiterMaterial);
      const radius = nodeRadius + Math.random() * 0.1;
      const speed = 0.01 + Math.random() * 0.01;
      const angle = Math.random() * Math.PI * 2;

      // Posición inicial a un lado
      orbiterMesh.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
      mesh.add(orbiterMesh); // hijo del nodo

      orbiters.push({ mesh: orbiterMesh, node, radius, speed, angle });
    }
  }

  // Conexiones entre nodos
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
      const line = new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x444444 }));

      edges.push({ line, start: startNode, end: endNode });
    }
  }

  return { nodes, nodeMeshes, edges, nodeGeometry, simplex, orbiters };
};
