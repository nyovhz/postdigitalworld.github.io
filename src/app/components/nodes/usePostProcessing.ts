"use client";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";

import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader";

export interface PostProcessingOptions {
  // --- Bloom ---
  bloom?: boolean;
  bloomIntensity?: number;
  bloomRadius?: number;
  bloomThreshold?: number;

  // --- FXAA ---
  fxaa?: boolean;

  // --- Motion Blur ---
  motionBlur?: boolean;
  motionDamp?: number;

  // --- Film Grain / Noise ---
  film?: boolean;
  filmIntensity?: number;
  filmGrayscale?: boolean;

  // --- Dot Screen (retro halftone effect) ---
  dots?: boolean;
  dotScale?: number;

  // --- Vignette ---
  vignette?: boolean;
  vignetteOffset?: number;
  vignetteDarkness?: number;

  // --- Gamma correction ---
  gammaCorrection?: boolean;
}

export const setupPostProcessing = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: PostProcessingOptions = {}
) => {
  const composer = new EffectComposer(renderer);

  // --- Render principal ---
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const size = new THREE.Vector2(
    renderer.domElement.clientWidth,
    renderer.domElement.clientHeight
  );

  // --- Bloom ---
  if (options.bloom) {
    const bloomPass = new UnrealBloomPass(
      size,
      options.bloomIntensity ?? 0.5,
      options.bloomRadius ?? 0.4,
      options.bloomThreshold ?? 0.85
    );
    composer.addPass(bloomPass);
  }

  // --- FXAA ---
  if (options.fxaa) {
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms["resolution"].value.set(
      1 / size.x,
      1 / size.y
    );
    composer.addPass(fxaaPass);
  }

  // --- Motion Blur / Afterimage ---
  if (options.motionBlur) {
    const afterimagePass = new AfterimagePass();
    afterimagePass.uniforms["damp"].value = options.motionDamp ?? 0.3;
    composer.addPass(afterimagePass);
  }

  // --- Film Grain (2 args version) ---
  if (options.film) {
    const filmPass = new FilmPass(
      options.filmIntensity ?? 0.35,
      options.filmGrayscale ?? false
    );
    composer.addPass(filmPass);
  }

  // --- Dot Screen ---
  if (options.dots) {
    const dotPass = new DotScreenPass();
    dotPass.uniforms["scale"].value = options.dotScale ?? 2.5;
    composer.addPass(dotPass);
  }

  // --- Vignette ---
  if (options.vignette) {
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms["offset"].value = options.vignetteOffset ?? 1.0;
    vignettePass.uniforms["darkness"].value = options.vignetteDarkness ?? 1.2;
    composer.addPass(vignettePass);
  }

  // --- Gamma Correction (final stage) ---
  if (options.gammaCorrection ?? true) {
    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaCorrectionPass);
  }

  return composer;
};
