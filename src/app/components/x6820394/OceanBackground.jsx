'use client'

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Water } from "three/examples/jsm/objects/Water";
import { Sky } from "three/examples/jsm/objects/Sky";
import { useAudio } from "@/app/components/Audio/AudioProvider";

export default function OceanBackground() {
  const mountRef = useRef(null);
  const { analyserDataRef, isPlaying } = useAudio();

  useEffect(() => {
    const container = mountRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(50, 30, 120);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x010214);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x88aaff, 0.05));

    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const waterNormals = new THREE.TextureLoader().load(
      "https://threejs.org/examples/textures/waternormals.jpg",
      (t) => t.wrapS = t.wrapT = THREE.RepeatWrapping
    );
    const water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(0, 0, -1),
      sunColor: 0x111111,
      waterColor: 0x000010,
      distortionScale: 30,
      fog: scene.fog !== undefined
    });
    water.rotation.x = -Math.PI / 2;
    scene.add(water);

    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);
    const skyUniforms = sky.material.uniforms;
    skyUniforms["turbidity"].value = 8;
    skyUniforms["rayleigh"].value = 0.05;
    skyUniforms["mieCoefficient"].value = 0.00001;
    skyUniforms["mieDirectionalG"].value = 0.95;
    skyUniforms["sunPosition"].value.set(0, 0, -1);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(sky).texture;

    const clock = new THREE.Clock();
    const center = new THREE.Vector3(0, 10, 0);
    let radius = 120;
    let targetRadius = 120;
    let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    function handleMouseMove(e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }

    function handleWheel(e) {
      targetRadius += e.deltaY * 0.2;
      targetRadius = Math.min(Math.max(targetRadius, 60), 300);
    }

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("wheel", handleWheel);
    }

    let gamma = 0;
    let beta = 0;
    let smoothGamma = 0;
    let smoothBeta = 0;

    if (isMobile && window.DeviceOrientationEvent) {
      const requestPermission = async () => {
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
          try {
            const perm = await DeviceOrientationEvent.requestPermission();
            if (perm !== "granted") console.warn("Giroscopio denegado");
          } catch (err) {
            console.error(err);
          }
        }
      };
      requestPermission();

      window.addEventListener("deviceorientation", (e) => {
        gamma = e.gamma ?? 0;
        beta = e.beta ?? 60;
      });
    }

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isPlaying && analyserDataRef.current) {
        const data = analyserDataRef.current;
        const len = data.length;
        const low = data.slice(0, len * 0.25).reduce((a, b) => a + b, 0) / len / 255;
        const mid = data.slice(len * 0.25, len * 0.6).reduce((a, b) => a + b, 0) / len / 255;
        const high = data.slice(len * 0.6).reduce((a, b) => a + b, 0) / len / 255;

        water.material.uniforms["distortionScale"].value = 2 + high * 6;
        water.material.uniforms["time"].value += delta + low * 0.03;
        const baseColor = new THREE.Color(0x000010);
        const audioColor = new THREE.Color().lerpColors(baseColor, new THREE.Color(0x00ffff), mid);
        water.material.uniforms["waterColor"].value.copy(audioColor);
      } else {
        water.material.uniforms["time"].value += delta;
      }

      sky.rotation.y += delta * 0.005;
      water.rotation.z += delta * 0.001;
      radius += (targetRadius - radius) * 0.05;

      if (isMobile) {
        const gammaLimit = 30;
        const betaLimit = 10;

        const gammaAdj = Math.max(Math.min(gamma, gammaLimit), -gammaLimit);
        const betaAdj = Math.max(Math.min(beta - 60, betaLimit), -betaLimit);

        const gammaRad = THREE.MathUtils.degToRad(gammaAdj);
        const betaRad = THREE.MathUtils.degToRad(betaAdj);

        smoothGamma += (gammaRad - smoothGamma) * 0.1;
        smoothBeta += (betaRad - smoothBeta) * 0.1;

        camera.position.set(
          center.x + Math.sin(smoothGamma) * radius,
          center.y + 30,
          center.z + Math.cos(smoothGamma) * radius
        );

        camera.lookAt(center);
        camera.rotation.x += smoothBeta * 0.5;
      } else {
        targetRotX += (mouseY * 0.4 - targetRotX) * 0.05;
        targetRotY += (mouseX * 1.5 - targetRotY) * 0.05;

        const x = center.x + Math.cos(targetRotY) * radius;
        const z = center.z + Math.sin(targetRotY) * radius;
        const y = center.y + targetRotX * 20;

        camera.position.set(x, y, z);
        camera.lookAt(center);
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (!isMobile) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("wheel", handleWheel);
      }
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [analyserDataRef, isPlaying]);

  return <div ref={mountRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 20 }} />;
}
