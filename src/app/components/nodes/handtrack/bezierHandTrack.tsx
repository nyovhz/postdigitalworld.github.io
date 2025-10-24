import React, { forwardRef, useRef, useImperativeHandle } from "react";

interface BezierPathProps {
  color?: string;
  strokeWidth?: number;
}

export interface BezierHandle {
  updateCurve: (from: { x: number; y: number }, to: { x: number; y: number }) => void;
}

export const BezierHandTrack = forwardRef<BezierHandle, BezierPathProps>(
  ({ color = "#696969ff", strokeWidth = 2 }, ref) => {
    const pathRef = useRef<SVGPathElement>(null);

    const getBezierPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const cx = (from.x + to.x) / 2;
      return `M ${from.x} ${from.y} Q ${cx} ${from.y} ${to.x} ${to.y}`;
    };

    useImperativeHandle(ref, () => ({
      updateCurve(from, to) {
        if (pathRef.current) {
          pathRef.current.setAttribute("d", getBezierPath(from, to));
        }
      },
    }));

    return (
      <svg
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
        }}
      >
        <path ref={pathRef} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      </svg>
    );
  }
);
