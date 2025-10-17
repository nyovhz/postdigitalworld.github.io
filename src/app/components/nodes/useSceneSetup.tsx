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
  scene.background = new THREE.Color("#0c0c0c");

  const InitialCameraPos = new THREE.Vector3(0, 0, 25);
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.copy(InitialCameraPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true, stencil: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mountRef.current.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const keyLight = new THREE.DirectionalLight(0xffe4cc, 1.5);
  keyLight.position.set(10, 10, 10);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 50;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x99ccff, 0.8);
  fillLight.position.set(-10, 5, 5);
  scene.add(fillLight);

  const rimLight = new THREE.SpotLight(0xffffff, 1.2);
  rimLight.position.set(0, 10, -15);
  rimLight.angle = Math.PI / 6;
  rimLight.penumbra = 0.3;
  rimLight.decay = 2;
  rimLight.distance = 60;
  rimLight.castShadow = true;
  scene.add(rimLight);

  const bottomLight = new THREE.PointLight(0x6699ff, 0.3);
  bottomLight.position.set(0, -10, 10);
  scene.add(bottomLight);

  const planeGeometry = new THREE.PlaneGeometry(200, 200);
  const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -5;
  plane.receiveShadow = true;
  scene.add(plane);

  return { scene, camera, renderer, controls, InitialCameraPos };
};
