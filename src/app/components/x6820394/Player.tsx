'use client';

import { useAudio } from '../Audio/AudioProvider';
import PlayerSkin from './player_components/PlayerSkin';
import Banner from './player_components/Banner';
import Timeline from './player_components/Timeline';
import PlaylistModal from './Modal';
import React, { useEffect, useRef, useState } from 'react';
import { Image } from 'lucide-react';

type Track = {
  src: string;
  title?: string;
  artist?: string;
};

type Image = {
  src: string;
};

type Visuals = {
  code: string;
}

type PlayerProps = {
  playlist: Track[];
  playerSkin: Image[];
  playerSkinPanel: Image;
  backgroundState: () => void;
  optimizeImageUrl?: (src: string) => string;
};

export default function Player({
  playlist,
  playerSkin,
  playerSkinPanel,
  backgroundState,
  optimizeImageUrl = (src) => src,
}: PlayerProps) {
  const {
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    next,
    prev,
    seek,
    setPlaylist,
    stop,
  } = useAudio();

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && playlist.length) {
      setPlaylist(playlist);
      hasInitialized.current = true;
    }
  }, [playlist, setPlaylist]);

/* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);


  const [currentSkinIndex, setCurrentSkinIndex] = useState(0);
  const [currentHydraCodeIndex, setCurrentHydraCodeIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const validImages = Array.isArray(playerSkin)
    ? playerSkin.filter((i) => i?.src)
    : [];

  const tracks = Array.isArray(playlist)
    ? playlist.filter((t) => t?.src)
    : [];

  const currentSkin = optimizeImageUrl(
    validImages[currentSkinIndex]?.src || ''
  );

  const imageBackground = optimizeImageUrl(playerSkinPanel?.src);

  if (!validImages.length || !tracks.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white rounded-lg overflow-hidden shadow-lg">
          No skins or tracks available
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-20 p-4" >
      <div className="relative rounded-lg overflow-hidden flex flex-col items-center">
        {isModalOpen && (
          <PlaylistModal onClose={closeModal} playlist={playlist} />
        )}

        <PlayerSkin
          image={currentSkin}
          imageBack={imageBackground}
          isPlaying={isPlaying}
          onPlayPause={togglePlay}
          onNext={next}
          onPrev={prev}
          onRandom={() => {
            next();
          }}
          onNextSkin={() =>
            setCurrentSkinIndex((i) => (i + 1) % validImages.length)
          }
          openModal={openModal}
          backgroundState={backgroundState}
        />
        <Banner
          title={tracks[currentTrackIndex]?.title}
          author={tracks[currentTrackIndex]?.artist}
        />

        <Timeline
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
        />
      </div>
    </div>
  );
}
