'use client';

import WhatsAppButton from './WhatsAppButton';
import { useState, useEffect } from 'react';
import './Footer.css';

export default function Footer() {
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  useEffect(() => {
    // Aparece después de la animación del buscador (7.6s + 5.8s + 0.6s ≈ 14s)
    const timer = window.setTimeout(() => setShowWhatsApp(true), 14200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <footer className="bg-[#1E3A5F] text-white">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-white/90">
          © 2025 MARCOS MORICI TRACTORES
        </p>
      </div>

      {showWhatsApp && <WhatsAppButton isFloating className="whatsapp-button-animate" />}
    </footer>
  );
}