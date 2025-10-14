'use client'

import { useState, useEffect } from 'react'
import Player from '@/app/components/x6820394/Player'
import ThreeBackground from '@/app/components/x6820394/ThreeBackground'
import OceanBackground from '@/app/components/x6820394/OceanBackground'
import CircularAudioAnalyser from '@/app/components/x6820394/player_components/CircularAnalyser'
import { Leva } from 'leva'
import { data } from '@/app/components/x6820394/data'
import TypewriterText from '@/app/components/utils/TypewriterText'

const { device_playlist, device_skin, device_skin_panel, optimizeCloudinaryUrl } = data

export default function Page() {
  const [backgroundType, setBackgroundType] = useState<1 | 2>(2)
  const [isLoading, setIsLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  function toggleBackground() {
    setBackgroundType(prev => (prev === 1 ? 2 : 1))
  }

  useEffect(() => {
    // Simular carga de assets
    const timeout = setTimeout(() => {
      setFadeOut(true) // Inicia fade-out
      setTimeout(() => setIsLoading(false), 800) // Luego ocultar
    }, 2000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <>
      {/* Fondos */}
      {backgroundType === 1 && <ThreeBackground />}
      {backgroundType === 2 && <OceanBackground />}

      {/* Player */}
      <Player
        playlist={device_playlist}
        playerSkin={device_skin}
        playerSkinPanel={device_skin_panel}
        backgroundState={toggleBackground}
        optimizeImageUrl={optimizeCloudinaryUrl}
      />

      {/* Analizador circular */}
      <CircularAudioAnalyser />

      {/* Leva inspector */}
      <div style={{ position: 'fixed', top: 10, left: 10, zIndex: 9999 }}>
        <Leva
          collapsed
          fill
          theme={{
            colors: {
              elevation1: "#121517",
              elevation2: "#000000",
              accent2: '#4b4b4b',
              highlight2: "#50ff6dff"
            },
          }}
        />
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100000,
            opacity: fadeOut ? 0 : 1,
            transition: 'opacity 0.8s ease'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Contenedor fijo para Typewriter */}
            <div
              style={{
                minHeight: '60px', // espacio fijo para evitar desplazamiento
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <TypewriterText
                text="x317962"
                className="text-3xl md:text-5xl font-extrabold tracking-wider text-center text-[#35d851] select-none"
                speed={80}
              />
            </div>

            {/* Spinner */}
            <div
              style={{
                width: 80,
                height: 80,
                border: '6px solid #35d851',
                borderTop: '6px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginTop: '20px',
              }}
            />
          </div>
        </div>
      )}

      {/* Animación del spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
