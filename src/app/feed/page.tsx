"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";

interface EventoFeed {
  id: string;
  tipo: "ouro" | "lendaria" | "pacote";
  usuario: string;
  jogador?: string;
  time?: string;
  raridade?: string;
  createdAt: string;
}

function formatHora(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatHoraData(dateStr: string) {
  const date = new Date(dateStr);
  const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const data = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${hora} - ${data}`;
}

export default function FeedPage() {
  const [eventos, setEventos] = useState<EventoFeed[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef<HTMLDivElement | null>(null);

  const fetchEventos = useCallback(async (cursor?: string) => {
    setLoading(true);
    const res = await fetch(`/api/feed${cursor ? `?cursor=${cursor}` : ""}`);
    const data = await res.json();
    if (cursor) {
      setEventos((prev) => [...prev, ...data.eventos]);
    } else {
      setEventos(data.eventos);
    }
    setNextCursor(data.nextCursor);
    setHasMore(!!data.nextCursor);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEventos();
  }, [fetchEventos]);

  // Rolagem infinita
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor) {
          fetchEventos(nextCursor);
        }
      },
      { threshold: 1 }
    );
    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, [nextCursor, hasMore, loading, fetchEventos]);

  return (
    <main className="w-full min-h-[80vh] py-10 px-2 md:px-8 lg:px-32 bg-gradient-to-br from-white/80 via-blue-100/60 to-blue-200/80">
      <h1 className="text-3xl font-bold text-center text-brasil-blue mb-8 flex items-center justify-center gap-3">
        <span>📢</span> Feed de Eventos
      </h1>
      {eventos.map((evento, idx) => {
        const horaData = formatHoraData(evento.createdAt);
        if (evento.tipo === "ouro") {
          return (
            <div key={evento.id + idx} className="bg-white/90 rounded-lg shadow p-4 border-l-8 border-yellow-400 flex flex-col items-center text-center gap-2 mb-8">
              <span className="text-yellow-400 text-3xl drop-shadow-lg">🏅</span>
              <div>
                <span className="font-bold text-yellow-600 text-lg">{evento.usuario}</span> <span className="text-brasil-blue">acaba de obter uma figurinha</span> <span className="font-bold text-yellow-600">Ouro</span><span className="font-semibold text-brasil-blue">: {evento.jogador}</span> <span className="text-brasil-blue">do</span> <span className="font-semibold text-brasil-blue">{evento.time}!</span>
                <span className="block text-xs text-brasil-blue mt-1">{horaData}</span>
              </div>
            </div>
          );
        }
        if (evento.tipo === "lendaria") {
          return (
            <div
              key={evento.id + idx}
              className="relative bg-white/90 rounded-lg shadow p-4 border-l-8 border-purple-500 overflow-visible flex flex-col items-center text-center gap-2 mb-8"
            >
              {/* Áurea roxa/dourada */}
              <span className="absolute -inset-2 z-0 rounded-2xl pointer-events-none animate-pulse"
                style={{
                  boxShadow: '0 0 24px 8px #a855f7, 0 0 48px 16px #facc15',
                  background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(250,204,21,0.15) 100%)',
                }}
              />
              <span className="text-purple-600 text-3xl drop-shadow-lg z-10">👑</span>
              <div className="relative z-10">
                <span className="font-bold text-purple-700 text-lg">{evento.usuario}</span> <span className="text-brasil-blue">acaba de obter uma figurinha</span> <span className="font-bold text-purple-700">Lendário</span><span className="font-semibold text-brasil-blue">: {evento.jogador}</span> <span className="text-brasil-blue">do</span> <span className="font-semibold text-brasil-blue">{evento.time}!</span>
                <span className="block text-xs text-brasil-blue mt-1">{horaData}</span>
              </div>
            </div>
          );
        }
        if (evento.tipo === "pacote") {
          return (
            <div key={evento.id + idx} className="bg-white/90 rounded-lg shadow p-4 border-l-8 border-green-500 flex flex-col items-center text-center gap-2 mb-8">
              <span className="text-brasil-green text-3xl drop-shadow-lg">📦</span>
              <div>
                <span className="font-bold text-brasil-green text-lg">{evento.usuario}</span> <span className="text-brasil-blue">comprou um pacote e está um passo à frente na corrida para completar o álbum!</span>
                <span className="block text-xs text-brasil-blue mt-1">{horaData}</span>
              </div>
            </div>
          );
        }
        return null;
      })}
      {loading && (
        <div className="text-center text-brasil-blue mb-8">Carregando...</div>
      )}
      <div ref={loader} />
      {!hasMore && eventos.length > 0 && (
        <div className="text-center text-brasil-blue mt-4">Fim do feed.</div>
      )}
    </main>
  );
} 