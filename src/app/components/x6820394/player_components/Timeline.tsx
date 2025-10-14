export default function Timeline({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (newTime: number) => void;
}) {
  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    onSeek(newTime);
  };

  return (
    <div className="mt-2 w-[300px] text-white text-xs flex items-center gap-2">
      <span className="w-[40px] text-right">{formatTime(currentTime)}</span>
      <div className="relative flex-1 h-2 cursor-pointer" onClick={handleClick}>
        <div
          className="absolute top-0 left-0 h-full border border-[rgba(0,100,0,0.8)] bg-black rounded-full"
          style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
        />
      </div>
      <span className="w-[40px] text-left">{formatTime(duration)}</span>
    </div>
  );
}
