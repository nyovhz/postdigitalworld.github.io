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
  scene.background = new THREE.Color("#161616");

  const InitialCameraPos = new THREE.Vector3(0, 0, 15);
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.copy(InitialCameraPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  (renderer as any).outputEncoding = (THREE as any).sRGBEncoding;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.autoClear = false;

  mountRef.current.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.02;

  // --- Lights ---
  const ambient = new THREE.AmbientLight(0xffffff, 100);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 5);
  dirLight.position.set(10, 20, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  scene.add(dirLight);

  // --- Shadow plane ---
  const planeGeo = new THREE.PlaneGeometry(200, 200);
  const planeMat = new THREE.ShadowMaterial({ opacity: 0.1 });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -5;
  plane.receiveShadow = true;
  scene.add(plane);

  return { scene, camera, renderer, controls, InitialCameraPos };
};
