'use client';

import { useEffect, useRef } from 'react';

interface AdSenseProps {
  slot: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: boolean;
}

export default function AdSense({ slot, style, format = 'auto', responsive = true }: AdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Verifica se estamos em ambiente de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('AdSense desativado em ambiente de desenvolvimento');
      return;
    }

    try {
      // Verifica se o script já foi carregado
      if (window.adsbygoogle && !window.adsbygoogle.loaded) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Erro ao carregar anúncio:', error);
    }
  }, []);

  // Em ambiente de desenvolvimento, não renderiza o componente
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  return (
    <div ref={adRef}>
      <ins
        className="adsbygoogle"
        style={style || { display: 'block' }}
        data-ad-client="ca-pub-3473963599771699"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
} 