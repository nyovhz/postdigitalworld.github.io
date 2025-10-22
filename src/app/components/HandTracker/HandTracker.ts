import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export class HandTracker {
  private handLandmarker: HandLandmarker;
  public video: HTMLVideoElement;
  private running = false;
  private frameInterval: number;
  private lastUpdateTime = 0;
  public landmarks: Array<Array<{ x: number; y: number; z: number }>> = [];
  public onLandmarks?: (landmarks: Array<Array<{ x: number; y: number; z: number }>>) => void;

  constructor(
    handLandmarker: HandLandmarker,
    video: HTMLVideoElement,
    fps: number = 30
  ) {
    this.handLandmarker = handLandmarker;
    this.video = video;
    this.frameInterval = 1000 / fps;
    this.running = true;
    this.loop();
  }

  private loop = () => {
    if (!this.running) return;

    const now = performance.now();
    if (now - this.lastUpdateTime > this.frameInterval) {
      this.lastUpdateTime = now;

      const results = this.handLandmarker.detectForVideo(this.video, now);
      this.landmarks = results.landmarks || [];
      if (this.onLandmarks) this.onLandmarks(this.landmarks);
    }

    requestAnimationFrame(this.loop);
  };

  public stop() {
    this.running = false;
    if (this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      this.video.srcObject = null;
    }
  }

  public getLandmarks() {
    return this.landmarks;
  }

  static async create(videoElement?: HTMLVideoElement, fps = 30) {
    const wasmPath = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
    const resolver = await FilesetResolver.forVisionTasks(wasmPath);
    const modelAssetPath = "/models/hand_landmarker.task";

    const handLandmarker = await HandLandmarker.createFromOptions(resolver, {
      baseOptions: { modelAssetPath, delegate: "GPU" },
      runningMode: "VIDEO",
      numHands: 1,
    });

    const video = videoElement || document.createElement("video");
    if (!video.srcObject) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      video.srcObject = stream;

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
    }

    return new HandTracker(handLandmarker, video, fps);
  }
}
