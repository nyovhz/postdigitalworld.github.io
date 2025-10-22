"use client";
import React, { forwardRef, useEffect, useState } from "react";
import * as THREE from "three";
import TypewriterText from "../utils/TypewriterText";

interface NodeInfoPanelsProps {
  mesh: THREE.Mesh;
  infoOpacity: number;
  infoVisible: boolean;
}

export const NodeInfoPanels = forwardRef<HTMLDivElement, NodeInfoPanelsProps>(
  ({ mesh, infoOpacity, infoVisible }, ref) => {
    const [showContent, setShowContent] = useState(false);
    const hasLink = !!mesh.userData.link;

    useEffect(() => {
      if (infoVisible) {
        setShowContent(false);
        const timer = setTimeout(() => setShowContent(true), 1000);
        return () => clearTimeout(timer);
      } else {
        setShowContent(false);
      }
    }, [infoVisible]);

    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: infoVisible ? infoOpacity : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          {[
            { top: 0, left: 0, rotate: "0deg" },
            { top: 0, right: 0, rotate: "45deg" },
            { bottom: 0, left: 0, rotate: "-45deg" },
            { bottom: 0, right: 0, rotate: "90deg" },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "20%",
                height: "20%",
                borderTop: "2px solid #0000FF",
                borderLeft: "2px solid #0000FF",
                transform: `rotate(${pos.rotate})`,
                ...pos,
              }}
            />
          ))}
        </div>

        {hasLink && showContent &&(
          <div
            style={{
              position: "absolute",
              left: "-100%",
              top: 0,
              width: "100%",
              height: "100%",
              background: "#0000FF44",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              pointerEvents: "auto",
              borderRadius: "100%",
            }}
            onClick={() => window.open("nodes" + mesh.userData.link, "_blank")}
          >
            open →
          </div>
        )}
        {showContent && (
<div
          style={{
            position: "absolute",
            right: "-110%",
            top: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            <li><strong>ID:</strong> {mesh.userData.id}</li>
            <li><strong>Name:</strong> {mesh.userData.name ?? "N/A"}</li>
            <li>
              x: {mesh.position.x.toFixed(2)}<br />
              y: {mesh.position.y.toFixed(2)}<br />
              z: {mesh.position.z.toFixed(2)}
            </li>
          </ul>
        </div>
        )}
        

        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "-100%",
            width: "300%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            whiteSpace: "normal",
            wordWrap: "break-word",
          }}
        >
          {!showContent && (
            <div style={{
              width: 40,
              height: 40,
              border: "4px solid #5e5e5eff",
              borderTop: "4px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }} />
          )}

          {showContent && (
            <TypewriterText
              text={mesh.userData.description?.trim() ? mesh.userData.description : "connection refused"}
              speed={100}
            />
          )}
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
);

NodeInfoPanels.displayName = "NodeInfoPanels";
