import * as THREE from "three";
import { ShaderMaterial } from "three";

export const baseMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x111111,
  emissive: 0x000000,
  roughness: 0.25,
  metalness: 0.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05,
  sheen: 0.0,
  iridescence: 0.0,
});

export const selectedMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x797979,
  emissive: 0x797979,
  roughness: 0.1,
  metalness: 0.0,
  opacity: 0.3,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
});

export const baseMaterial2 = new THREE.MeshPhysicalMaterial({
  color: 0x000000,
  emissive: 0x000000,
  roughness: 0.2,
  metalness: 0.0,
  transparent: true,
  opacity: 0.8,
  transmission: 0.6,
  ior: 1.45,
  thickness: 0.2,
  clearcoat: 0.4,
  clearcoatRoughness: 0.3,
  side: THREE.DoubleSide,
});

export const selectedMaterial2 = new THREE.MeshPhysicalMaterial({
  color: 0xcccccc,
  emissive: 0x000000,
  roughness: 0.4,
  metalness: 1.0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.1,
  reflectivity: 0.1,
  transparent: false,
});

export const scanMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    intensity: { value: 0.1 },
    glitchStrength: { value: 0.05 },
  },
  vertexShader: `
    varying vec3 vPos;
    varying vec3 vNormal;

    void main() {
      vPos = position;
      vNormal = normalMatrix * normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float intensity;
    uniform float glitchStrength;
    varying vec3 vPos;
    varying vec3 vNormal;

    float scanLine(float y, float time) {
      float pos = fract(y * 3.0 + time * 2.0);
      return exp(-pow(pos - 0.5, 2.0) * 10.0);
    }

    void main() {
      float scan = scanLine(vPos.y, time);
      float pulse = 0.5 + 0.5 * sin(time * 2.0);
      float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 3.0);
      float glitch = sin(vPos.y * 50.0 + time * 20.0) * glitchStrength;
      float glow = (scan + fresnel + glitch) * pulse * intensity;
      vec3 color = vec3(glow);
      gl_FragColor = vec4(color, 0.85);
    }
  `,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  side: THREE.DoubleSide,
});

export const hoverMaterial = new THREE.MeshStandardMaterial({
  color: 0x000000,
  emissive: 0x3333ff,
  roughness: 0.5,
  metalness: 0.0,
});

export const orbiterMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ff00,       // verde
  transparent: true,     
  opacity: 0.4,          // translucidez
  metalness: 0.1,        // ligera reflexión metálica
  roughness: 0.2,        // superficie un poco suave
  side: THREE.DoubleSide, // opcional, si quieres que sea visible desde dentro
});
