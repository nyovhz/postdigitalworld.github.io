import React, { forwardRef } from "react";

interface TargetNodeProps {
  size?: number;
  color?: string;
  opacity?: number;
}

export const TargetHandTrack = forwardRef<HTMLDivElement, TargetNodeProps>(
  ({ size = 20, color = "#696969ff", opacity = 0.5 }, ref) => {
    const lineSize = size * 0.5; // largo de los segmentos
    const borderWidth = 1;

    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: size,
          height: size,
          pointerEvents: "none",
          opacity,
        }}
      >
        {/* Cuadrante superior izquierdo */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: lineSize,
            height: lineSize,
            borderTop: `${borderWidth}px solid ${color}`,
            borderLeft: `${borderWidth}px solid ${color}`,
            borderTopLeftRadius: 4,
          }}
        />
        {/* Cuadrante superior derecho */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: lineSize,
            height: lineSize,
            borderTop: `${borderWidth}px solid ${color}`,
            borderRight: `${borderWidth}px solid ${color}`,
            borderTopRightRadius: 4,
          }}
        />
        {/* Cuadrante inferior izquierdo */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: lineSize,
            height: lineSize,
            borderBottom: `${borderWidth}px solid ${color}`,
            borderLeft: `${borderWidth}px solid ${color}`,
            borderBottomLeftRadius: 4,
          }}
        />
        {/* Cuadrante inferior derecho */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: lineSize,
            height: lineSize,
            borderBottom: `${borderWidth}px solid ${color}`,
            borderRight: `${borderWidth}px solid ${color}`,
            borderBottomRightRadius: 4,
          }}
        />
      </div>
    );
  }
);
