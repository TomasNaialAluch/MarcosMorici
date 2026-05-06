'use client';

import { useEffect, useState } from 'react';
import WhatsAppButton from '@/components/WhatsAppButton';
import './Footer.css';

/**
 * Misma cadencia que el header: el flotante aparece tras la animación inicial.
 */
export default function FooterWhatsAppDefer() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), 14200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!show) return null;

  return <WhatsAppButton isFloating className="whatsapp-button-animate" />;
}
