'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useAudio } from "@/app/components/Audio/AudioProvider"; 

const ThreePathTunnelVertices = () => {
  const canvasRef = useRef(null);
  const { analyserDataRef, isPlaying } = useAudio();

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    const pathPoints = [];
    const segments = 30;
    const radiusMain = 20;
    const radiusTube = 2;
    const twists = 3;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const cx = radiusMain * Math.cos(t);
      const cy = radiusMain * Math.sin(t);
      const theta = twists * t;

      const x = cx + radiusTube * Math.cos(theta) * Math.cos(t);
      const y = cy + radiusTube * Math.cos(theta) * Math.sin(t);
      const z = radiusTube * Math.sin(theta);

      pathPoints.push(new THREE.Vector3(x, y, z));
    }

    const path = new THREE.CatmullRomCurve3(pathPoints, true);
    const curveSegments = 200;
    const geometry = new THREE.TubeGeometry(path, curveSegments, radiusTube, 12, true);

    const vertexShader = `
      uniform float uTime;
      uniform float uLow;
      uniform float uMid;
      uniform float uHigh;
      varying float vAudioIntensity;

      void main() {
        float intensity = uLow * 0.8 + uMid * 0.5 + uHigh * 0.3;

        vec3 newPos = position + normal * sin(uTime * 3.0 + position.z * 5.0) * intensity * 0.5;

        vAudioIntensity = intensity;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        gl_PointSize = 2.0 + (uHigh * 10.0); // tamaño dinámico de los vértices
      }
    `;

    const fragmentShader = `
      varying float vAudioIntensity;

      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard; // forma circular
        vec3 color = mix(vec3(0.1, 0.5, 1.0), vec3(0.8, 1.0, 1.0), vAudioIntensity);
        gl_FragColor = vec4(color, 0.9);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uLow: { value: 0 },
        uMid: { value: 0 },
        uHigh: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    });

    // --- Mesh de puntos ---
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const clock = new THREE.Clock();
    const loopTime = 100;

    let animationFrameId;

    // --- Animación ---
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      let low = 0, mid = 0, high = 0;

      if (isPlaying && analyserDataRef.current) {
        const dataArray = analyserDataRef.current;
        const len = dataArray.length;
        const lowFreq = dataArray.slice(0, len * 0.25);
        const midFreq = dataArray.slice(len * 0.25, len * 0.6);
        const highFreq = dataArray.slice(len * 0.6);

        const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const normalize = (val) => val / 255;

        low = normalize(avg(lowFreq));
        mid = normalize(avg(midFreq));
        high = normalize(avg(highFreq));
      }

      // Uniforms
      material.uniforms.uTime.value = elapsedTime;
      material.uniforms.uLow.value = low;
      material.uniforms.uMid.value = mid;
      material.uniforms.uHigh.value = high;

      // Cámara sigue el túnel
      const t = (elapsedTime % loopTime) / loopTime;
      const t2 = ((elapsedTime + 0.01) % loopTime) / loopTime;

      const pos = path.getPointAt(t);
      const pos2 = path.getPointAt(t2);

      camera.position.copy(pos);
      camera.lookAt(pos2);

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [analyserDataRef, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
};

export default ThreePathTunnelVertices;
