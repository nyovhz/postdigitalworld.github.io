// materials.ts
import * as THREE from "three";

export const baseMaterial = new THREE.MeshStandardMaterial({
  color: 0x000000,
  emissive: 0x000000,
  roughness: 0.2,
  metalness: 0.7,
});

export const selectedMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x797979,
  emissive: 0x797979,
  roughness: 0.1,
  metalness: 0.0,
  transparent: true,
  opacity: 0.3,
  transmission: 0.8, // cristal
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
});

export const hoverMaterial = new THREE.MeshStandardMaterial({
  color: 0x000000,
  emissive: 0x3333ff,
  roughness: 0.5,
  metalness: 0.0,
});
