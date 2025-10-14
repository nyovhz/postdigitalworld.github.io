import { Play, Pause, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

export default function Controls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onRandom,
}: {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRandom: () => void;
}) {
  return (
    <div className="mt-4 flex items-center gap-4 text-white">
      <button onClick={onPrev} className="p-2 hover:bg-gray-700 rounded">
        <ChevronLeft />
      </button>
      <button onClick={onPlayPause} className="p-2 hover:bg-gray-700 rounded">
        {isPlaying ? <Pause /> : <Play />}
      </button>
      <button onClick={onNext} className="p-2 hover:bg-gray-700 rounded">
        <ChevronRight />
      </button>
      <button onClick={onRandom} className="p-2 hover:bg-gray-700 rounded">
        <Shuffle />
      </button>
    </div>
  );
}
