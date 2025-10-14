import React from 'react';

type TimelineProps = {
  currentTime: number;
  duration: number;
  onSeek: (newTime: number) => void;
};

export default function Timeline({ currentTime, duration, onSeek }: TimelineProps) {
  // Format seconds into mm:ss
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Calculate click position and trigger seek
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    onSeek(newTime);
  };

  return (
    <div onClick={handleClick}>
      <span>{formatTime(currentTime)}</span>
      <div>
        <div style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
      </div>
      <span>{formatTime(duration)}</span>
    </div>
  );
}
