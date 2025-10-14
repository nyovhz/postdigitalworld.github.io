import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  ListMusic,
} from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const HydraDebug = dynamic(
  () => import("./HydraDebug"),
  { ssr: false }
);

export default function PlayerSkin({
  image,
  imageBack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onRandom,
  onNextSkin,
  openModal,
  backgroundState,
}: {
  image: string;
  imageBack: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onRandom: () => void;
  onNextSkin: () => void;
  openModal: () => void;
  backgroundState: () => void;
}) {
  const [scale, setScale] = useState(1.2);
  const [svgSize, setSvgSize] = useState(500 * scale);
  const [clickedButtonIndex, setClickedButtonIndex] = useState<number | null>(
    null
  );
  const clickableRadius = 25 * scale;
  const [opnPanel, setOpnPanel] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;

      if (width < 320) {
        setScale(0.7);
        setSvgSize(500 * 0.7);
      } else if (width < 480) {
        setScale(1.1);
        setSvgSize(500 * 1.1);
      } else if (width < 768) {
        setScale(1);
        setSvgSize(500 * 1);
      } else {
        setScale(1.2);
        setSvgSize(500 * 1.2);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Detecta si es un dispositivo táctil
    setIsTouchDevice(typeof window !== "undefined" && "ontouchstart" in window);
  }, []);

  const buttons = [
    {
      x: 138,
      y: 88,
      onClick: backgroundState,
      icon: <Shuffle size={20 * scale} color="transparent" />,
    },
    {
      x: 225,
      y: 334,
      onClick: onNextSkin,
      icon: <Shuffle size={20 * scale} color="transparent" />,
    },
    {
      x: 148,
      y: 368,
      onClick: onPrev,
      icon: (
        <div style={{ transform: "rotate(25deg)" }}>
          <ChevronLeft
            size={20 * scale}
            color="green"
            className={`transition-opacity duration-1000 ${
              opnPanel
                ? "opacity-30 pointer-events-none image-back-group"
                : "opacity-100 pointer-events-auto image-out-group"
            }`}
          />
        </div>
      ),
    },
    {
      x: 225,
      y: 389,
      onClick: onPlayPause,
      icon: isPlaying ? (
        <Pause
          size={15 * scale}
          color="green"
          className={`transition-opacity duration-1000 ${
            opnPanel
              ? "opacity-30 pointer-events-none image-back-group"
              : "opacity-100 pointer-events-auto image-out-group"
          }`}
        />
      ) : (
        <Play
          size={15 * scale}
          color="green"
          className={`transition-opacity duration-1000 ${
            opnPanel
              ? "opacity-30 pointer-events-none image-back-group"
              : "opacity-100 pointer-events-auto image-out-group"
          }`}
        />
      ),
    },
    {
      x: 302,
      y: 368,
      onClick: onNext,
      icon: (
        <div style={{ transform: "rotate(-25deg)" }}>
          <ChevronRight
            size={20 * scale}
            color="green"
            className={`transition-opacity duration-1000 ${
              opnPanel
                ? "opacity-30 pointer-events-none image-back-group"
                : "opacity-100 pointer-events-auto image-out-group"
            }`}
          />
        </div>
      ),
    },
    {
      x: 295,
      y: 313,
      onClick: onRandom,
      icon: <Shuffle size={13 * scale} color="green" />,
    },
    {
      x: 155,
      y: 313,
      onClick: openModal,
      icon: <ListMusic size={14 * scale} color="green" />,
    },
  ];

  function handleClick(index: number, onClickFn: () => void) {
    setClickedButtonIndex(index);
    onClickFn();
    setTimeout(() => {
      setClickedButtonIndex(null);
    }, 300);
  }

  return (
    <div style={{ position: "relative", width: svgSize, height: svgSize }}>
      {/* Fondo Hydra */}
      <div
        style={{
          position: "absolute",
          top: -35,
          left: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 300,
            height: 300,
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <HydraDebug size={svgSize} />
        </div>
      </div>

      {/* Definición filtro SVG glow */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="5"
              floodColor="#00ffff"
              floodOpacity="1"
            />
          </filter>
        </defs>
      </svg>

      {/* SVG principal */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          width={svgSize}
          height={svgSize}
          role="img"
          aria-label="Music player controls"
          onClick={() => {
            if (isTouchDevice) {
              setOpnPanel((prev) => !prev); // toggle solo en touch
            }
          }}
          onMouseEnter={() => {
            if (!isTouchDevice) setOpnPanel(false);
          }}
          onMouseLeave={() => {
            if (!isTouchDevice) setOpnPanel(true);
          }}
        >
          <image
            href={imageBack}
            x="0"
            y="0"
            width={svgSize}
            height={svgSize}
            className={`${
              opnPanel ? "image-back-group z-50" : "image-out-group"
            }`}
          />
          <image href={image} x="0" y="0.1" width={svgSize} height={svgSize} />

          {buttons.map(({ x, y, onClick, icon }, i) => (
            <g
              key={i}
              onClick={() => handleClick(i, onClick)}
              style={{ cursor: "pointer", outline: "none" }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClick(i, onClick);
                }
              }}
              filter={clickedButtonIndex === i ? "url(#glow)" : undefined}
            >
              <circle
                cx={x * scale + clickableRadius}
                cy={y * scale + clickableRadius}
                r={clickableRadius}
                fill="transparent"
              />
              <foreignObject
                x={x * scale}
                y={y * scale}
                width={clickableRadius * 2}
                height={clickableRadius * 2}
                pointerEvents="none"
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                  }}
                >
                  {icon}
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
