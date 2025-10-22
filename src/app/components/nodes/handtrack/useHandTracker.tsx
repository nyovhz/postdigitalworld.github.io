"use client";
import { useEffect, useRef, useState } from "react";
import { HandTracker } from "@/components/HandTracker/HandTracker";

export function useHandTracker(fps = 20) {
  const trackerRef = useRef<HandTracker | null>(null);
  const landmarksRef = useRef<any[]>([]);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        if (trackerRef.current) return;

        const tracker = await HandTracker.create(undefined, fps);
        if (!active) return;

        trackerRef.current = tracker;
        setVideo(tracker.video);
        setIsLoading(false);

        tracker.onLandmarks = () => {
          landmarksRef.current = tracker.getLandmarks();
        };
      } catch (err: any) {
        if (active) {
          console.error("Error al inicializar HandTracker:", err);
          setError(err.message || "Error al acceder a la cámara o cargar el modelo.");
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
      trackerRef.current?.stop();
      trackerRef.current = null;
    };
  }, [fps]);

  return { trackerRef, landmarksRef, video, isLoading, error };
}
