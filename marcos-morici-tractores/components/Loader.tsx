'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Loader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    // Mantener loader 7s y luego fade-out corto
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // Tiempo de fade out
    }, 7000); // Tiempo mínimo de visualización (7 segundos)

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white ${
        isFading ? 'loader-fade-out' : ''
      }`}
    >
      <div className="flex flex-col items-center justify-center w-full h-full">
        {videoFailed ? (
          <Image
            src="/logo/Logo Main.png"
            alt="Marcos Morici Tractores"
            width={800}
            height={600}
            className="max-h-[100vh] max-w-[100vw] md:max-h-[80vh] md:max-w-[80vw] w-auto h-auto object-contain"
            unoptimized
          />
        ) : (
          <video
            autoPlay
            muted
            playsInline
            loop={false}
            poster="/logo/Logo Main.png"
            className="max-h-[100vh] max-w-[100vw] md:max-h-[80vh] md:max-w-[80vw] w-auto h-auto object-contain"
            onError={() => setVideoFailed(true)}
          >
            <source src="/videos/Logo Main animation.mp4" type="video/mp4" />
          </video>
        )}
      </div>
    </div>
  );
}
