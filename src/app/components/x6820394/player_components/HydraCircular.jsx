import { useEffect, useRef } from "react";
import Hydra from "hydra-synth";
import { useAudio } from "../new/AudioProvider";
import { button, useControls } from "leva";

export default function HydraCircle({ code, size }) {
  const canvasRef = useRef(null);
  const hydraRef = useRef(null);
  const animationFrameRef = useRef(null);
  const { analyserDataRef } = useAudio();
  const containerRef = useRef(null);

  const lowRef = useRef(0);
  const midRef = useRef(0);
  const highRef = useRef(0);

  const lastSize = useRef({ width: 0, height: 0 });

  const {
    frequency,
    speed,
    opacity,
    feedback,
    rotation,
    r,
    g,
    b,
    noise_,
    noise_scale,
    startCam,
  } = useControls({
    frequency: { value: 30, min: 1, max: 100 },
    speed: { value: 1, min: 0, max: 1 },
    opacity: { value: 1.0, min: 0, max: 1.5, step: 0.01 },
    feedback: { value: 0, min: 0.5, max: 0.99, step: 0.01 },
    rotation: { value: 0, min: -1, max: 1, step: 0.01 },
    r: { value: 0.4, min: 0, max: 1 },
    g: { value: 1, min: 0, max: 1 },
    b: { value: 0, min: 0, max: 1 },
    noise_: { value: 0.5, min: 0, max: 1 },
    noise_scale: { value: 1.2, min: 0, max: 10 },
    startCam: button(() => {
      if (typeof s0 !== "undefined") {
        s0.initCam();
        console.log("Cámara activada con Hydra");
      } else {
        console.warn("s0 no está definido aún");
      }
    }),
  });

  useEffect(() => {
    window.frequency = frequency;
    window.speed = speed;
    window.opacity = opacity;
    window.feedback = feedback;
    window.rotation = rotation;
    window.startCam = startCam;
    window.r = r;
    window.g = g;
    window.b = b;
    window.noise_ = noise_;
    window.noise_scale = noise_scale;
  }, [
    frequency,
    speed,
    opacity,
    feedback,
    rotation,
    r,
    g,
    b,
    noise_,
    noise_scale,
    startCam,
  ]);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const width = Math.floor(rect.width * dpr);
    const height = Math.floor(rect.height * dpr);

    console.log("resizeCanvas called");
    console.log(`CSS size: ${Math.round(rect.width)} x ${Math.round(rect.height)} px`);
    console.log(`Canvas size: ${width} x ${height} px`);
    console.log(`DPR: ${dpr}`);

    const hasChanged =
      width !== lastSize.current.width || height !== lastSize.current.height;

    if (hasChanged) {
      lastSize.current = { width, height };

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";

      if (hydraRef.current) {
        hydraRef.current.setResolution(width, height);
      }

      console.log(`[HydraCanvas] Resized:`);
      console.log(`  CSS size:    ${Math.round(rect.width)} x ${Math.round(rect.height)} px`);
      console.log(`  Canvas size: ${width} x ${height} px`);
      console.log(`  DPR:         ${dpr}`);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let observer;

    const initializeHydra = () => {
      if (!hydraRef.current) {
        hydraRef.current = new Hydra({
          detectAudio: false,
          canvas: canvas,
          width: canvas.width,
          height: canvas.height,
        });
      }

      try {
        eval(code);
      } catch (err) {
        console.error("Error ejecutando código Hydra:", err);
      }
    };

    const delayedInit = () => {
      resizeCanvas();
      initializeHydra();
    };

    requestAnimationFrame(delayedInit);

    const updateAudio = () => {
      if (analyserDataRef.current) {
        const data = analyserDataRef.current;
        const third = Math.floor(data.length / 3);

        lowRef.current = parseFloat(
          (data.slice(0, third).reduce((sum, v) => sum + v, 0) / third).toFixed(2)
        );
        midRef.current = parseFloat(
          (data.slice(third, third * 2).reduce((sum, v) => sum + v, 0) / third).toFixed(2)
        );
        highRef.current = parseFloat(
          (data.slice(third * 2).reduce((sum, v) => sum + v, 0) / (data.length - third * 2)).toFixed(2)
        );
      }

      animationFrameRef.current = requestAnimationFrame(updateAudio);
    };
    updateAudio();

    // Resize observer en el contenedor para cambios de tamaño
    observer = new ResizeObserver(() => {
      resizeCanvas();
    });
    if(containerRef.current) observer.observe(containerRef.current);

    // Escuchar evento resize de la ventana
    const onResize = () => {
      resizeCanvas();
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (observer) observer.disconnect();
      window.removeEventListener("resize", onResize);
      hydraRef.current = null;
    };
  }, [code, analyserDataRef]);

  return (
  <div
  ref={containerRef}
  className="relative overflow-hidden flex items-center justify-center"
  style={{ width: size, height: size }}
>
  <div
    style={{
      width: 300,
      height: 300,
      borderRadius: "50%",
      overflow: "hidden",
      position: "relative",
    }}
  >
    <canvas ref={canvasRef} className="w-full h-full block" />
  </div>
</div>

);

}
