'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  adClient: string;
  adSlot: string;
  style?: React.CSSProperties;
  format?: string;
}

export default function AdSense({ adClient, adSlot, style, format = 'auto' }: AdSenseProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Erro ao carregar anúncio:', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={format}
    />
  );
} 