import { useEffect, useRef } from "react";
import Hydra from "hydra-synth";
import { useControls, folder, button } from "leva";
import { useAudio } from "@/app/components/Audio/AudioProvider";

export default function HydraDebug({ size }) {
  const canvasRef = useRef(null);
  const hydraRef = useRef(null);
  const { analyserDataRef } = useAudio();

  const {
    frequency,
    speed,
    osc2freq,
    osc2speed,
    noise_,
    noise_scale,
    noise_offset,
    r,
    g,
    b,
    brightness,
    feedback,
    rotation,
    modulate,
    LowFreqReactive,
    LowFreqIntensity,
    MidFreqReactive,
    MidFreqIntensity,
    HighFreqReactive,
    HighFreqIntensity,
    StartCam,
    BlendCam
  } = useControls({
    "OSC 1": folder({
      frequency: { value: 25, min: 1, max: 100 },
      speed: { value: 0.21, min: 0, max: 1 },
    }, { collapsed: true }),
    "OSC 2": folder({
      osc2freq: { value: 40, min: 0, max: 50 },
      osc2speed: { value: 0.1, min: 0, max: 1 },
    }, { collapsed: true }),
    NOISE: folder({
      noise_: { value: 0.2, min: 0, max: 1 },
      noise_scale: { value: 3, min: 0, max: 10 },
      noise_offset: { value: 0.37, min: 0, max: 1, step: 0.01 },
    }, { collapsed: true }),
    LOOK: folder({
      r: { value: 0.4, min: 0, max: 1 },
      g: { value: 0.32, min: 0, max: 1 },
      b: { value: 0.82, min: 0, max: 1 },
      brightness: { value: 0.0, min: 0, max: 0.5, step: 0.01 },
    }, { collapsed: true }),
    OTHERS: folder({
      feedback: { value: 0.0, min: 0.5, max: 0.99, step: 0.01 },
      rotation: { value: 0, min: -1, max: 1, step: 0.01 },
      modulate: { value: 0.1, min: 0, max: 1 },
    }, { collapsed: true }),
    AUDIO: folder({
      LowFreqReactive: {
        options: [
          "none",
          "brightness", "rotation", "modulate", "r", "g", "b",
          "frequency", "speed", "osc2freq", "osc2speed",
          "noise_", "noise_scale", "noise_offset", "feedback", "BlendCam",
        ],
        label: "Affect With LOW",
      },
      LowFreqIntensity: { value: 0, min: 0, max: 1, step: 0.01 },
      MidFreqReactive: {
        options: [
          "none",
          "brightness", "rotation", "modulate", "r", "g", "b",
          "frequency", "speed", "osc2freq", "osc2speed",
          "noise_", "noise_scale", "noise_offset", "feedback", "BlendCam",
        ],
        label: "Affect With MID",
      },
      MidFreqIntensity: { value: 0, min: 0, max: 1, step: 0.01 },
      HighFreqReactive: {
        options: [
          "brightness", "rotation", "modulate", "r", "g", "b",
          "frequency", "speed", "osc2freq", "osc2speed",
          "noise_", "noise_scale", "noise_offset", "feedback", "BlendCam", "none"
        ],
        label: "Affect With HIGH",
      },
      HighFreqIntensity: { value: 1.0, min: 0, max: 1, step: 0.01 },
    }, { collapsed: true }),
    CAMERA: folder ({
      startCam: button(() => {
      if (typeof s0 !== "undefined") {
        s0.initCam();
        console.log("Cámara activada con Hydra");
      } else {
        console.warn("s0 no está definido aún");
      }
    }),
    BlendCam: { value: 0.0, min: 0, max: 2 }
    }, { collapsed: true }),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const resolution = size * dpr;
    canvas.width = resolution;
    canvas.height = resolution;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    if (hydraRef.current) hydraRef.current.setResolution(resolution, resolution);
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const resolution = size * dpr;
    hydraRef.current = new Hydra({
      detectAudio: false,
      canvas,
      width: resolution,
      height: resolution,
    });
    return () => { hydraRef.current = null; };
  }, [size]);

  useEffect(() => {
    let animationId;
    const intensityDefaults = {
      brightness: 1, rotation: 0.5, modulate: 0.4,
      r: 0.4, g: 0.4, b: 1,
      frequency: 20, speed: 0.1,
      osc2freq: 10, osc2speed: 0.05,
      noise_: 0.1, noise_scale: 0.5,
      noise_offset: 0.01, feedback: 0.01,
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (!hydraRef.current || !analyserDataRef.current) return;
      const data = analyserDataRef.current;
      const len = data.length;
      const lowFreq = data.slice(0, Math.floor(len * 0.25));
      const midFreq = data.slice(Math.floor(len * 0.25), Math.floor(len * 0.6));
      const highFreq = data.slice(Math.floor(len * 0.6));
      const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
      const normalize = val => val / 255;
      const low = normalize(avg(lowFreq));
      const mid = normalize(avg(midFreq));
      const high = normalize(avg(highFreq));

      let modulatedFrequency = frequency;
      let modulatedSpeed = speed;
      let modulatedOsc2freq = osc2freq;
      let modulatedOsc2speed = osc2speed;
      let modulatedNoise_ = noise_;
      let modulatedNoiseScale = noise_scale;
      let modulatedNoiseOffset = noise_offset;
      let modulatedR = r;
      let modulatedG = g;
      let modulatedB = b;
      let modulatedBrightness = brightness;
      let modulatedFeedback = feedback;
      let modulatedRotation = rotation;
      let modulatedModulate = modulate;
      let modulatedCam = BlendCam;

      const applyModulation = (bandValue, target, intensity) => {
      if (target === "none") return;
      const i = intensity * 10 ?? intensityDefaults[target] ?? 0.5;
      switch (target) {
        case "brightness": modulatedBrightness += bandValue * i; break;
        case "rotation": modulatedRotation += bandValue * i; break;
        case "modulate": modulatedModulate += bandValue * i; break;
        case "r": modulatedR = Math.min(1, Math.max(0, modulatedR + bandValue * i)); break;
        case "g": modulatedG = Math.min(1, Math.max(0, modulatedG + bandValue * i)); break;
        case "b": modulatedB = Math.min(1, Math.max(0, modulatedB + bandValue * i)); break;
        case "frequency":
          modulatedFrequency += bandValue * i;
          modulatedFrequency = Math.max(1, modulatedFrequency);
          break;
        case "speed":
          modulatedSpeed += bandValue * i;
          modulatedSpeed = Math.min(1, Math.max(0, modulatedSpeed));
          break;
        case "osc2freq":
          modulatedOsc2freq += bandValue * i;
          modulatedOsc2freq = Math.max(1, modulatedOsc2freq);
          break;
        case "osc2speed":
          modulatedOsc2speed += bandValue * i;
          modulatedOsc2speed = Math.min(1, Math.max(0, modulatedOsc2speed));
          break;
        case "noise_":
          modulatedNoise_ += bandValue * i;
          modulatedNoise_ = Math.min(1, Math.max(0, modulatedNoise_));
          break;
        case "noise_scale":
          modulatedNoiseScale += bandValue * i;
          modulatedNoiseScale = Math.min(10, Math.max(0, modulatedNoiseScale));
          break;
        case "noise_offset":
          modulatedNoiseOffset += bandValue * i;
          modulatedNoiseOffset = Math.min(1, Math.max(0, modulatedNoiseOffset));
          break;
        case "feedback":
          modulatedFeedback += bandValue * i;
          modulatedFeedback = Math.min(0.99, Math.max(0.5, modulatedFeedback));
          break;
        case "BlendCam":
          modulatedCam += bandValue * i;
          modulatedCam = Math.min(0.99, Math.max(0.5, modulatedCam));
          break;
      }
    };

      applyModulation(low, LowFreqReactive, LowFreqIntensity);
      applyModulation(mid, MidFreqReactive, MidFreqIntensity);
      applyModulation(high, HighFreqReactive, HighFreqIntensity);

      try {
        osc(modulatedFrequency, modulatedSpeed)
          .rotate(100,modulatedRotation) 
          .blend(o0, modulatedFeedback)
          .modulate(o2,modulatedCam)
          .color(modulatedR, modulatedG, modulatedB)
          .modulate(osc(modulatedOsc2freq, modulatedOsc2speed))
          .modulate(o1, modulatedNoise_)
          .modulate(o0,modulatedModulate)
          .mult(o2,modulatedCam)
          .brightness(modulatedBrightness)
          .out();

        noise(modulatedNoiseScale, modulatedNoiseOffset).out(o1);
        src(s0).out(o2)
        

      } catch (e) {
        console.error("Error updating visual:", e);
      }
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [
    frequency, speed,
    osc2freq, osc2speed,
    noise_, noise_scale, noise_offset,
    r, g, b, brightness,
    feedback, rotation, modulate,
    LowFreqReactive, LowFreqIntensity,
    MidFreqReactive, MidFreqIntensity,
    HighFreqReactive, HighFreqIntensity,
    StartCam, BlendCam,
    analyserDataRef,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", zIndex: 10, backgroundColor: "black", }}
    />
  );
}
