"use client";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export const useSceneSetup = (mountRef: React.RefObject<HTMLDivElement>) => {
  if (!mountRef.current) return null;

  const width = mountRef.current.clientWidth;
  const height = mountRef.current.clientHeight;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#141414'); // Fondo blanco

  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
  camera.position.set(0, 0, 20);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  mountRef.current.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.02;

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(10, 20, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 50;
  scene.add(dirLight);

  // Plano para recibir sombras
  const planeGeo = new THREE.PlaneGeometry(200, 200);
  const planeMat = new THREE.ShadowMaterial({ opacity: 0.1 });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -5; // Ajusta según la altura de tus nodos
  plane.receiveShadow = true;
  scene.add(plane);

  return { scene, camera, renderer, controls };
};
