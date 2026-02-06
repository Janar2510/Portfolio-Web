'use client';

import NeuralBackground from './NeuralBackground';

export function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <NeuralBackground
        className="opacity-100"
      />
      {/* Fallback gradients if needed, but NeuralBackground handles most */}
    </div>
  );
}
