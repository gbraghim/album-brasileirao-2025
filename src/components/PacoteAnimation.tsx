import { useEffect, useState } from 'react';

interface PacoteAnimationProps {
  isOpen: boolean;
  onAnimationComplete: () => void;
}

export default function PacoteAnimation({ isOpen, onAnimationComplete }: PacoteAnimationProps) {
  const [fase, setFase] = useState<'fechado'|'abrindo'|'aberto'>('fechado');

  useEffect(() => {
    if (isOpen) {
      setFase('fechado');
      const t1 = setTimeout(() => setFase('abrindo'), 500);
      const t2 = setTimeout(() => setFase('aberto'), 1500);
      const t3 = setTimeout(() => onAnimationComplete(), 2500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [isOpen, onAnimationComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="relative w-[340px] h-[340px] flex items-center justify-center">
        {/* Pacote de figurinhas */}
        <div className={`absolute left-1/2 top-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${fase==='abrindo'||fase==='aberto' ? 'scale-110 drop-shadow-2xl' : ''}`}>
          <img
            src={fase==='abrindo'||fase==='aberto' ? '/pacote-figurinhas-aberto.png' : '/pacoteTransparente.png'}
            alt="Pacote de figurinhas"
            className={`object-contain w-full h-full ${fase==='abrindo' ? 'animate-pulse' : ''}`}
          />
          {/* Efeito de brilho */}
          {fase==='abrindo' && (
            <div className="absolute inset-0 rounded-full bg-yellow-200/60 blur-2xl animate-ping" />
          )}
        </div>

        {/* Confete */}
        {fase==='abrindo' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${Math.random()*90+5}%`,
                  top: `${Math.random()*80+10}%`,
                  width: `${Math.random()*10+8}px`,
                  height: `${Math.random()*10+8}px`,
                  background: ['#FFD700','#FFF','#00FF7F','#1E90FF','#FF6347','#F0E68C'][Math.floor(Math.random()*6)],
                  opacity: 0.8,
                  transform: `rotate(${Math.random()*360}deg)`,
                  animation: `confetti-fall 1.2s linear forwards`,
                  animationDelay: `${Math.random()*0.5}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Suspense: pacote aberto, mas nada revelado ainda */}
        {fase==='aberto' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-yellow-600 animate-pulse drop-shadow-lg">Revelando figurinhas...</span>
          </div>
        )}
      </div>
      {/* Animações customizadas */}
      <style jsx global>{`
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(80px) scale(0.7); }
        }
      `}</style>
    </div>
  );
} 