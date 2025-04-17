import { useEffect, useState } from 'react';
import Image from 'next/image';

interface PacoteAnimationProps {
  isOpen: boolean;
  onAnimationComplete: () => void;
}

export default function PacoteAnimation({ isOpen, onAnimationComplete }: PacoteAnimationProps) {
  const [showPacote, setShowPacote] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Inicia com o pacote fechado
      setShowPacote(true);
      setShowConfetti(false);

      // Após 1.5 segundos, mostra o pacote aberto
      const timer1 = setTimeout(() => {
        setShowPacote(false);
      }, 1500);

      // Após 2 segundos, mostra o confete
      const timer2 = setTimeout(() => {
        setShowConfetti(true);
      }, 2000);

      // Após 3.5 segundos, completa a animação
      const timer3 = setTimeout(() => {
        onAnimationComplete();
      }, 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen, onAnimationComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="relative w-[300px] h-[300px]">
        {/* Pacote fechado */}
        <div 
          className={`absolute inset-0 transition-all duration-500 transform ${
            showPacote 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-150 rotate-12'
          }`}
        >
          <Image
            src="/pacote-figurinhas.png"
            alt="Pacote de figurinhas"
            fill
            className={`object-contain ${showPacote ? 'animate-bounce' : ''}`}
          />
        </div>

        {/* Pacote aberto */}
        <div 
          className={`absolute inset-0 transition-all duration-500 transform ${
            !showPacote 
              ? 'opacity-100 scale-100 rotate-0' 
              : 'opacity-0 scale-50 -rotate-12'
          }`}
        >
          <Image
            src="/pacote-figurinhas-aberto.png"
            alt="Pacote de figurinhas aberto"
            fill
            className="object-contain animate-pulse"
          />
        </div>

        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#FFA07A'][Math.floor(Math.random() * 5)],
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `confetti-fall ${Math.random() * 2 + 1}s linear forwards`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 