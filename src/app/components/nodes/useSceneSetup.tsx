"use client";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export interface SceneSetup {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  InitialCameraPos: THREE.Vector3;
}

export const useSceneSetup = (
  mountRef: React.RefObject<HTMLDivElement>
): SceneSetup | null => {
  if (!mountRef.current) return null;

  const width = mountRef.current.clientWidth;
  const height = mountRef.current.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d12); // fondo default

  const InitialCameraPos = new THREE.Vector3(0, 0, 25);
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.copy(InitialCameraPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  (renderer as any).outputEncoding = (THREE as any).sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.autoClear = false;

  mountRef.current.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.03;

  // --- Lighting setup ---
  const keyLight = new THREE.DirectionalLight(0xfff0e5, 2.5);
  keyLight.position.set(15, 20, 10);
  keyLight.castShadow = true;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x4499ff, 1.0);
  fillLight.position.set(-15, 10, 10);
  scene.add(fillLight);

  const accentLight = new THREE.SpotLight(0xffffff, 2.0);
  accentLight.position.set(0, 15, -15);
  accentLight.angle = Math.PI / 6;
  accentLight.penumbra = 0.4;
  accentLight.decay = 2;
  accentLight.distance = 50;
  accentLight.castShadow = true;
  scene.add(accentLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambient);

  // --- No environment map, solo fondo y luces ---

  return { scene, camera, renderer, controls, InitialCameraPos };
};
