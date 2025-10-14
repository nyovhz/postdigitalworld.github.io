'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAudio } from '@/app/components/Audio/AudioProvider';

export default function CircularAudioAnalyser() {
  const { analyserDataRef, isPlaying } = useAudio();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [size, setSize] = useState<number>(100);

  useEffect(() => {
    const updateSize = () => {
      const baseSize = Math.min(window.innerWidth, window.innerHeight);
      setSize(Math.min(baseSize, 100));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rotationAngle = 0;

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);

      const dataArray = analyserDataRef.current;
      if (!dataArray) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = size / 8;
      const bars = dataArray.length;
      const angleStep = (Math.PI * 2) / bars + 0.1;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);
      ctx.translate(-centerX, -centerY);

      for (let i = 35; i < bars; i++) {
        const value = dataArray[i];
        const barHeight = value / 6;
        const angle = i * angleStep;
        const xStart = centerX + Math.cos(angle) * radius;
        const yStart = centerY + Math.sin(angle) * radius;
        const xEnd = centerX + Math.cos(angle) * (radius + barHeight);
        const yEnd = centerY + Math.sin(angle) * (radius + barHeight);

        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      ctx.restore();
      rotationAngle += 0.002;
    };

    draw();

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [analyserDataRef, size]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      return;
    }
    const cancelDraw = drawVisualizer();
    return () => cancelDraw && cancelDraw();
  }, [isPlaying, drawVisualizer]);

  return (
    <div
      className="fixed bottom-4 right-4 z-50"
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{
          borderRadius: '50%',
          background: 'transparent',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
