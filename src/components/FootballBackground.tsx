import React from 'react';

export default function FootballBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-yellow-400 opacity-20" />
      
      {/* Elementos flutuantes */}
      <div className="absolute inset-0">
        {/* Bolas de futebol */}
        <div className="football-element absolute top-[10%] left-[5%] w-8 h-8 bg-white rounded-full animate-float-slow">
          <div className="absolute inset-0 bg-[url('/ball.svg')] bg-contain bg-no-repeat bg-center" />
        </div>
        <div className="football-element absolute top-[30%] right-[15%] w-12 h-12 bg-white rounded-full animate-float-medium">
          <div className="absolute inset-0 bg-[url('/ball.svg')] bg-contain bg-no-repeat bg-center" />
        </div>
        
        {/* Chuteiras */}
        <div className="football-element absolute top-[60%] left-[20%] w-16 h-8 animate-float-fast">
          <div className="absolute inset-0 bg-[url('/boot.svg')] bg-contain bg-no-repeat bg-center" />
        </div>
        
        {/* Camisetas */}
        <div className="football-element absolute top-[40%] right-[25%] w-12 h-12 animate-float-medium">
          <div className="absolute inset-0 bg-[url('/jersey.svg')] bg-contain bg-no-repeat bg-center" />
        </div>
        <div className="football-element absolute bottom-[15%] left-[35%] w-12 h-12 animate-float-slow">
          <div className="absolute inset-0 bg-[url('/jersey.svg')] bg-contain bg-no-repeat bg-center transform rotate-12" />
        </div>
        
        {/* Traves */}
        <div className="football-element absolute bottom-[5%] right-[5%] w-20 h-16 animate-float-slow">
          <div className="absolute inset-0 bg-[url('/goal.svg')] bg-contain bg-no-repeat bg-center" />
        </div>
      </div>

      {/* Overlay com gradiente verde e amarelo */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-yellow-400/10 to-blue-600/10" />
    </div>
  );
} 