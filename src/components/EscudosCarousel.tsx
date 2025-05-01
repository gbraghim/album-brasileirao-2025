import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getS3EscudoUrl } from '@/lib/utils';

interface Time {
  id: string;
  nome: string;
  escudo: string;
}

export default function EscudosCarousel() {
  const [times, setTimes] = useState<Time[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const response = await fetch('/api/times');
        const data = await response.json();
        setTimes(data);
      } catch (error) {
        console.error('Erro ao carregar times:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimes();
  }, []);

  const handleImageError = (timeNome: string, currentSrc: string) => {
    // Tenta diferentes formatos de arquivo
    const formats = ['.png', '.jpg', '.jpeg'];
    const currentFormat = currentSrc.split('.').pop();
    const nextFormat = formats.find(f => f !== `.${currentFormat}`);
    
    if (nextFormat) {
      const newSrc = currentSrc.replace(`.${currentFormat}`, nextFormat);
      const img = new window.Image();
      img.src = newSrc;
      
      img.onload = () => {
        const timeElement = document.querySelector(`[data-time="${timeNome}"]`) as HTMLImageElement;
        if (timeElement) {
          timeElement.src = newSrc;
        }
      };
      
      img.onerror = () => {
        setImageErrors(prev => ({ ...prev, [timeNome]: true }));
        console.error(`Erro ao carregar escudo do time ${timeNome}`);
      };
    } else {
      setImageErrors(prev => ({ ...prev, [timeNome]: true }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex space-x-8 animate-scroll">
        {/* Primeira linha de escudos */}
        <div className="flex space-x-8">
          {times.map((time) => (
            <div key={time.id} className="flex-shrink-0 w-24 h-24 relative">
              <Image
                src={imageErrors[time.nome] ? '/placeholder.jpg' : getS3EscudoUrl(time.escudo)}
                alt={`Escudo do ${time.nome}`}
                fill
                data-time={time.nome}
                onError={() => handleImageError(time.nome, time.escudo)}
                className="object-contain"
              />
            </div>
          ))}
        </div>
        {/* Segunda linha de escudos (duplicada para efeito contínuo) */}
        <div className="flex space-x-8">
          {times.map((time) => (
            <div key={`${time.id}-duplicate`} className="flex-shrink-0 w-24 h-24 relative">
              <Image
                src={imageErrors[time.nome] ? '/placeholder.jpg' : getS3EscudoUrl(time.escudo)}
                alt={`Escudo do ${time.nome}`}
                fill
                data-time={time.nome}
                onError={() => handleImageError(time.nome, time.escudo)}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
} 