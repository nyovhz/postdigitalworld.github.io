"use client";
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import TypewriterText from "../utils/TypewriterText";

interface NodeInfoPanelsProps {
  mesh: THREE.Mesh;
  screenPos: { x: number; y: number };
  boxSize: number;
  baseBoxSize: number;
  baseGap: number;
  baseFontSize: number;
  infoOpacity: number;
  infoVisible: boolean;
}

export const NodeInfoPanels: React.FC<NodeInfoPanelsProps> = ({
  mesh,
  screenPos,
  boxSize,
  baseBoxSize,
  baseGap,
  baseFontSize,
  infoOpacity,
}) => {
  const [showContent, setShowContent] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Resetear estados al cambiar de nodo
    setShowContent(false);
    setFadeIn(false);

    const timerTracking = setTimeout(() => {
      setShowContent(true);

      const timerFade = setTimeout(() => {
        setFadeIn(true);
      }, 50); // delay para fade-in
      return () => clearTimeout(timerFade);
    }, 1000); // duración del "tracking"

    return () => clearTimeout(timerTracking);
  }, [mesh]);

  const scaledGap = baseGap * (boxSize / baseBoxSize);
  const scaledFont = baseFontSize * (boxSize / baseBoxSize);
  const hasLink = !!mesh.userData.link;

const leftDescription = hasLink
  ? screenPos.x - scaledGap - boxSize
  : screenPos.x - boxSize - scaledGap;

// Tracker debe centrarse respecto al nodo
const leftTracker = screenPos.x - boxSize / 2;


  const panelCount = 3;
  const totalWidth = boxSize * panelCount + scaledGap * (panelCount - 1);

  // Spinner CSS
  const spinnerStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginTop: 8,
  };

  return (
    <>
      {/* Tracking overlay para todos los nodos */}
      {!showContent && (
        <div
          style={{
            position: "absolute",
            left: leftTracker,
            top: screenPos.y - boxSize + boxSize + scaledGap,
            width: boxSize,
            height: boxSize / 2,
            color: "white",
            background: "rgba(64,0,0,0.0)",
            padding: `${8 * (boxSize / baseBoxSize)}px`,
            borderRadius: `${6 * (boxSize / baseBoxSize)}px`,
            fontSize: `${scaledFont}px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
            opacity: 0.5,
            transition: "opacity 0.6s ease-in-out",
            textAlign: "center",
          }}
        >
          <TypewriterText text="tracking..." speed={30} />
          <div style={spinnerStyle}></div>
        </div>
      )}

      {/* Contenido real con fade-in */}
      {showContent && (
        <>
          {/* Caja de selección */}
          <div
            style={{
              position: "absolute",
              left: screenPos.x - boxSize / 2,
              top: screenPos.y - boxSize / 2,
              width: boxSize,
              height: boxSize,
              border: "2px solid blue",
              pointerEvents: "none",
              opacity: fadeIn ? infoOpacity : 0,
              transition: "opacity 0.6s ease-in-out",
            }}
          />

          {/* Panel de información */}
          <div
            style={{
              position: "absolute",
              left: screenPos.x + scaledGap,
              top: screenPos.y - boxSize / 2,
              width: boxSize,
              height: boxSize,
              color: "white",
              background: "rgba(0,0,0,0.0)",
              padding: `${8 * (boxSize / baseBoxSize)}px`,
              borderRadius: `${6 * (boxSize / baseBoxSize)}px`,
              fontSize: `${scaledFont}px`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              pointerEvents: "none",
              opacity: fadeIn ? infoOpacity : 0,
              transition: "opacity 0.6s ease-in-out",
            }}
          >
            <ul style={{ margin: 0, padding: 0, listStyle: "none", textAlign: "left" }}>
              <li><strong>ID:</strong> {mesh.userData.id}</li>
              <li><strong>Name:</strong> {mesh.userData.name ?? "N/A"}</li>
              <li style={{ marginTop: `${6 * (boxSize / baseBoxSize)}px` }}>
                x: {mesh.position.x.toFixed(2)}<br />
                y: {mesh.position.y.toFixed(2)}<br />
                z: {mesh.position.z.toFixed(2)}
              </li>
            </ul>
          </div>

          {/* Panel de Link */}
          {hasLink && (
            <div
              style={{
                position: "absolute",
                left: screenPos.x - scaledGap - boxSize,
                top: screenPos.y - boxSize / 2,
                width: boxSize,
                height: boxSize,
                color: "white",
                background: "rgba(91, 91, 255, 0.2)",
                padding: `${8 * (boxSize / baseBoxSize)}px`,
                borderRadius: '100%',
                fontSize: `${scaledFont}px`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                pointerEvents: "auto",
                opacity: fadeIn ? infoOpacity : 0,
                transition: "opacity 0.6s ease-in-out",
                cursor: "pointer",
              }}
              onClick={() => window.open("nodes" + mesh.userData.link, "_blank")}
            >
              open →
            </div>
          )}

          {/* Panel de descripción */}
          <div
            style={{
              position: "absolute",
              left: leftDescription,             // ya considera el link
              top: screenPos.y - boxSize + boxSize + scaledGap,
              width: totalWidth - boxSize,       // siempre el mismo tamaño
              height: boxSize / 2,               // siempre el mismo tamaño
              color: "white",
              background: "rgba(64,0,0,0.0)",
              padding: `${8 * (boxSize / baseBoxSize)}px`,
              borderRadius: `${6 * (boxSize / baseBoxSize)}px`,
              fontSize: `${scaledFont}px`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
              opacity: fadeIn ? infoOpacity : 0,
              transition: "opacity 0.6s ease-in-out",
              textAlign: "center",
            }}
          >
            <TypewriterText
              text={
                mesh.userData.description?.trim()
                  ? mesh.userData.description
                  : "potentially corrupted data"
              }
              speed={50}
            />
          </div>

        </>
      )}

      {/* Spinner animation keyframes */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
