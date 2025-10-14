'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

const optimizeCloudinaryUrl = (url : string, width = 1080) => {
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
};

type Track = {
  src: string;
  title?: string;
  artist?: string;
};

type AudioPlayerContextType = {
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setPlaylist: (tracks: Track[]) => void;
  analyserDataRef: React.MutableRefObject<Uint8Array | null>;
};

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [playlist, setPlaylistState] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const analyserDataRef = useRef<Uint8Array | null>(null);

  const next = () => {
    if (!playlist.length) return;

    setCurrentTrackIndex((i) => {
      const nextIndex = i + 1;
      if (nextIndex >= playlist.length) {
        setIsPlaying(false);
        return i;
      }
      return nextIndex;
    });
  };

  const prev = () => {
    if (!playlist.length) return;
    setCurrentTrackIndex((i) => (i - 1 + playlist.length) % playlist.length);
  };

  const stop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying((prev) => !prev);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setPlaylist = (tracks: Track[]) => {
    setPlaylistState(tracks);
    setCurrentTrackIndex(0);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const audioCtx = new AudioContext();
    audioCtxRef.current = audioCtx;

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audioCtx.close();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []); // ← sin playlist aquí

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (!playlist.length) return;

      setCurrentTrackIndex((i) => {
        const nextIndex = i + 1;
        if (nextIndex >= playlist.length) {
          setIsPlaying(false);
          return i;
        }
        return nextIndex;
      });
    };

    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
    };
  }, [playlist]); // ✅ esto ahora solo afecta al handler



  // ▶️ Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // 🎵 Cambiar track
  useEffect(() => {
    if (!playlist.length || !audioRef.current) return;

    const audio = audioRef.current;
    const track = playlist[currentTrackIndex];

    if (!track) return;

    if (audio.src !== track.src) {
      audio.src = track.src;
      audio.load();
      setCurrentTime(0);
    }

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex, playlist, isPlaying]);

  // 🎧 Analyser loop
  useEffect(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const tick = () => {
      analyser.getByteFrequencyData(dataArray);
      analyserDataRef.current = new Uint8Array(dataArray);
      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
  const audio = audioRef.current;
  if (!audio || !playlist.length) return;

  const track = playlist[currentTrackIndex];
  if (!track) return;

  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || "Sin título",
      artist: track.artist || "Desconocido",
      album: "x317962",
      artwork: [
        {
          src: optimizeCloudinaryUrl(
            "https://res.cloudinary.com/dp39ooacq/image/upload/v1745373858/nyovhz_black_water_texture_sea._57cb758e-9a74-4708-9473-d1f61afeae66_tmnxyb.png"
          ) || "",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler("previoustrack", prev);
    navigator.mediaSession.setActionHandler("nexttrack", next);
  }
}, [currentTrackIndex, playlist]);



  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrackIndex,
        setCurrentTrackIndex,
        currentTrack: playlist[currentTrackIndex] || null,
        isPlaying,
        currentTime,
        duration,
        play,
        pause,
        stop,
        togglePlay,
        next,
        prev,
        seek,
        setPlaylist,
        analyserDataRef,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('useAudio must be used within an AudioProvider');
  return context;
}
