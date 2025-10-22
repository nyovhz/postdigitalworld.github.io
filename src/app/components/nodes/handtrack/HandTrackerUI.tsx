import React, { forwardRef, useState, useEffect, useRef } from "react";

interface HandControllerProps {
  boxSize?: number;
  color?: string;
  opacity?: number;
  nodeProximity?: { x_: number; y_: number }[];
  cursorPos?: { x: number; y: number };
  suggestDistance?: number;
  cursorActiveOpacity?: number;
  lerpFactor?: number;
  isclicking?: boolean;
}

export const HandTrackUI = forwardRef<HTMLDivElement, HandControllerProps>(
  (
    {
      boxSize = 10,
      color = "#00e6acff",
      opacity = 0.6,
      nodeProximity = [],
      cursorPos,
      suggestDistance = 500,
      cursorActiveOpacity = 0.1,
      lerpFactor = 0.2,
      isclicking = false,
    },
    ref
  ) => {
    const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);
    const [smoothCursor, setSmoothCursor] = useState<{ x: number; y: number } | null>(null);
    const [smoothNode, setSmoothNode] = useState<{ x: number; y: number } | null>(null);
    const requestRef = useRef<number>();

    useEffect(() => {
      if (!cursorPos || nodeProximity.length === 0) {
        setActiveNodeIndex(null);
        return;
      }
      let closestIndex: number | null = null;
      let minDistance = suggestDistance;
      nodeProximity.forEach((node, i) => {
        const dx = node.x_ - cursorPos.x;
        const dy = node.y_ - cursorPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      });
      setActiveNodeIndex(closestIndex);
    }, [cursorPos, nodeProximity, suggestDistance]);

    useEffect(() => {
      const animate = () => {
        if (cursorPos) {
          setSmoothCursor((prev) => {
            if (!prev) return { x: cursorPos.x, y: cursorPos.y };
            return {
              x: prev.x + (cursorPos.x - prev.x) * lerpFactor,
              y: prev.y + (cursorPos.y - prev.y) * lerpFactor,
            };
          });
          if (activeNodeIndex !== null) {
            const target = nodeProximity[activeNodeIndex];
            setSmoothNode((prev) => {
              if (!prev) return { x: target.x_, y: target.y_ };
              return {
                x: prev.x + (target.x_ - prev.x) * lerpFactor,
                y: prev.y + (target.y_ - prev.y) * lerpFactor,
              };
            });
          } else setSmoothNode(null);
        }
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
    }, [cursorPos, activeNodeIndex, nodeProximity, lerpFactor]);

    const getBezierPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const cx = (from.x + to.x) / 2;
      return `M ${from.x} ${from.y} Q ${cx} ${from.y} ${to.x} ${to.y}`;
    };

    return (
      <>
        {smoothCursor && smoothNode && (
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
            <path
              d={getBezierPath(smoothCursor, smoothNode)}
              stroke={color}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        )}
        {smoothCursor && (
          <div
            ref={ref}
            style={{
              position: "absolute",
              left: smoothCursor.x - boxSize / 2,
              top: smoothCursor.y - boxSize / 2,
              width: boxSize,
              height: boxSize,
              pointerEvents: "none",
              opacity: activeNodeIndex !== null ? cursorActiveOpacity : opacity,
              transition: "opacity 0.1s linear",
            }}
          >
            {[{ top: 0, left: 0, rotate: "0deg" },
              { top: 0, right: 0, rotate: "45deg" },
              { bottom: 0, left: 0, rotate: "-45deg" },
              { bottom: 0, right: 0, rotate: "90deg" }
            ].map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: boxSize * 0.2,
                  height: boxSize * 0.2,
                  borderTop: `2px solid ${color}`,
                  borderLeft: `2px solid ${color}`,
                  transform: `rotate(${pos.rotate})`,
                  ...pos,
                }}
              />
            ))}
          </div>
        )}
        {smoothNode && (
          <div
            style={{
              position: "absolute",
              left: smoothNode.x - boxSize / 2,
              top: smoothNode.y - boxSize / 2,
              width: boxSize,
              height: boxSize,
              border: `2px solid ${color}`,
              borderRadius: "50%",
              pointerEvents: "none",
              opacity: 0.5,
              transition: "opacity 0.1s linear",
            }}
          />
        )}
      </>
    );
  }
);
