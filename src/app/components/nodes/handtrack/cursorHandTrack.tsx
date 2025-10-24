import React, { forwardRef } from "react";

interface HandControllerProps {
  boxSize?: number;
  color?: string;
}

export const CursorHandTrack = forwardRef<HTMLDivElement, HandControllerProps>(
  ({ boxSize = 20, color = "#696969ff" }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: boxSize,
          height: boxSize,
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Círculo hueco */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: `2px solid ${color}`,
            boxSizing: "border-box",
          }}
        />

        {/* Pulso animado */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: `2px solid ${color}`,
            transform: "translate(-50%, -50%) scale(1)",
            opacity: 0,
            animation: "pulse 1.2s infinite",
          }}
        />

        <style>
          {`
            @keyframes pulse {
              0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.5;
              }
              70% {
                transform: translate(-50%, -50%) scale(1.6);
                opacity: 0;
              }
              100% {
                transform: translate(-50%, -50%) scale(1.6);
                opacity: 0;
              }
            }
          `}
        </style>
      </div>
    );
  }
);
