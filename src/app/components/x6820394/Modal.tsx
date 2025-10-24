import { useAudio } from "../Audio/AudioProvider";
import TypewriterText from "../utils/TypewriterText";

type Track = {
  src: string;
  title?: string;
  artist?: string;
};

export default function PlaylistModal({
  onClose,
  playlist,
}: {
  onClose: () => void;
  playlist: Track[];
}) {
  const { setCurrentTrackIndex, currentTrack } = useAudio();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-xl w-full max-w-sm sm:max-w-md max-h-[80vh] overflow-y-auto custom-scrollbar border border-white/20 shadow-lg">
        <ul className="space-y-2">
          {playlist.map((track, i) => {
            const isCurrent = currentTrack?.src === track.src;
            return (
              <li
                key={`${track.src}-${i}`}
                className={`cursor-pointer hover:bg-white/10 p-2 rounded-full transition ${
                  isCurrent ? "" : ""
                }`}
                onClick={() => {
                  setCurrentTrackIndex(i);
                  onClose();
                }}
              >
                <div className="font-medium text-sm sm:text-base text-white truncate min-h-[1.5rem] sm:min-h-[1.75rem] text-center">
                  {isCurrent ? (
                    <TypewriterText text={track.title || "..."} />
                  ) : (
                    track.title || "Sin título"
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-300 truncate text-center">
                  {track.artist || "Desconocido"}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
