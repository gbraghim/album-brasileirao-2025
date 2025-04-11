import React from 'react';

export default function FootballBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-green-500 to-yellow-400 opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-yellow-400/10 to-blue-600/10" />
    </div>
  );
} 