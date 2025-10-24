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

export const useSceneSetup = (mountRef: React.RefObject<HTMLDivElement>): SceneSetup | null => {
  if (!mountRef.current) return null;

  const width = mountRef.current.clientWidth;
  const height = mountRef.current.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#080808');

  const InitialCameraPos = new THREE.Vector3(0, 0, 20);
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.copy(InitialCameraPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true});
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  mountRef.current.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  scene.add(new THREE.AmbientLight(0xffffff, 2.35));

  const keyLight = new THREE.DirectionalLight(0xffe4cc, 1.5);
  keyLight.position.set(10, 10, 10);
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

  return { scene, camera, renderer, controls, InitialCameraPos };
};
