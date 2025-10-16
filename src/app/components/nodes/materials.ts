// materials.ts
import * as THREE from "three";

export const baseMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x000000,          // negro
  emissive: 0x000000,
  roughness: 0.2,           // suave pero reflectante
  metalness: 0.0,
  transparent: true,
  opacity: 0.8,
  transmission: 0.6,        // algo de refracción
  ior: 1.45,
  thickness: 0.2,
  clearcoat: 0.4,
  clearcoatRoughness: 0.3,
  side: THREE.DoubleSide,
});

export const selectedMaterial = new THREE.MeshPhysicalMaterial({
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
    glitchStrength: { value: 0.05 }, // controla cuánto se desplazan las líneas
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

    // Función para generar líneas de escaneo tipo gaussiana
    float scanLine(float y, float time) {
      float pos = fract(y * 20.0 + time * 2.0); // frecuencia vertical
      return exp(-pow(pos - 0.5, 2.0) * 100.0); // ventana gaussiana
    }

    void main() {
      // Líneas base
      float scan = scanLine(vPos.y, time);

      // Pulso global
      float pulse = 0.5 + 0.5 * sin(time * 2.0);

      // Brillo angular tipo holograma
      float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 3.0);

      // Efecto glitch horizontal sutil
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
