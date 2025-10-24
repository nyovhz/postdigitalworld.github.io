'use client';

import React, { createContext, useContext, useRef, ReactNode } from 'react';

const SOUND_MAP = {
  ui: {
    transition: "https://res.cloudinary.com/dp39ooacq/video/upload/f_auto,q_auto/v1761280472/transition_ivnnn9.mp3",
    resolution: "https://res.cloudinary.com/dp39ooacq/video/upload/f_auto,q_auto/v1761280441/RESULT_dolyvw.mp3",
  },
};

type SoundKey = keyof typeof SOUND_MAP["ui"];

interface SFXContextType {
  play: (category: keyof typeof SOUND_MAP, key: SoundKey, volume?: number) => void;
}

const SFXContext = createContext<SFXContextType | undefined>(undefined);

export function SFXProvider({ children }: { children: ReactNode }) {
  const audioCache = useRef<Record<string, HTMLAudioElement>>({});

  const play = (category: keyof typeof SOUND_MAP, key: SoundKey, volume?: number) => {
    const src = SOUND_MAP[category]?.[key];
    if (!src) return;

    let audio = audioCache.current[src];

    if (!audio) {
      audio = new Audio(src);
      audioCache.current[src] = audio;
    }

    audio.currentTime = 0;
    audio.volume = volume ?? 0.8;
    audio.play().catch((err) => {
      console.warn("Error reproduciendo sonido:", err);
    });
  };

  return (
    <SFXContext.Provider value={{ play }}>
      {children}
    </SFXContext.Provider>
  );
}

export function useSFX() {
  const context = useContext(SFXContext);
  if (!context) throw new Error("useSFX debe usarse dentro de un SFXProvider");
  return context;
}
