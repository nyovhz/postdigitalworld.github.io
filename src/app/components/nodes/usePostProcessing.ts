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
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { Vector2 } from "three";

export interface PostProcessingOptions {
  bloom?: boolean;
  bloomIntensity?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  fxaa?: boolean;
  motionBlur?: boolean;
  motionDamp?: number;
  film?: boolean;
  filmIntensity?: number;
  filmGrayscale?: boolean;
  dots?: boolean;
  dotScale?: number;
  vignette?: boolean;
  vignetteOffset?: number;
  vignetteDarkness?: number;
  gammaCorrection?: boolean;
  depthOfField?: boolean;
  focus?: number;
  aperture?: number;
  maxblur?: number;
  glitch?: boolean;
  glitchMode?: number; // 0 = default, 1 = fuerte, 2 = esporádico
}

export const setupPostProcessing = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: PostProcessingOptions = {}
) => {
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const size = new Vector2(renderer.domElement.clientWidth, renderer.domElement.clientHeight);

  if (options.bloom) {
    const bloomPass = new UnrealBloomPass(
      size,
      options.bloomIntensity ?? 0.5,
      options.bloomRadius ?? 0.4,
      options.bloomThreshold ?? 0.85
    );
    composer.addPass(bloomPass);
  }

  if (options.fxaa) {
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms["resolution"].value.set(1 / size.x, 1 / size.y);
    composer.addPass(fxaaPass);
  }

  if (options.motionBlur) {
    const afterimagePass = new AfterimagePass();
    afterimagePass.uniforms["damp"].value = options.motionDamp ?? 0.3;
    composer.addPass(afterimagePass);
  }

  if (options.film) {
    const filmPass = new FilmPass(options.filmIntensity ?? 0.35, options.filmGrayscale ?? false);
    composer.addPass(filmPass);
  }

  if (options.dots) {
    const dotPass = new DotScreenPass();
    dotPass.uniforms["scale"].value = options.dotScale ?? 2.5;
    composer.addPass(dotPass);
  }

  if (options.vignette) {
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms["offset"].value = options.vignetteOffset ?? 1.0;
    vignettePass.uniforms["darkness"].value = options.vignetteDarkness ?? 1.2;
    composer.addPass(vignettePass);
  }

  if (options.glitch) {
    const glitchPass = new GlitchPass(options.glitchMode ?? 0);
    composer.addPass(glitchPass);
  }

  let bokehPass: BokehPass | undefined;
  if (options.depthOfField) {
    bokehPass = new BokehPass(scene, camera, {
      focus: options.focus ?? 3.0,
      aperture: options.aperture ?? 0.025,
      maxblur: options.maxblur ?? 0.01,
    });
    composer.addPass(bokehPass);
  }

  if (options.gammaCorrection ?? true) {
    const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
    composer.addPass(gammaCorrectionPass);
  }

  return { composer, bokehPass };
};
