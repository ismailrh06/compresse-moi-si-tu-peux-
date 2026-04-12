import { memo } from "react";
import type { Particle } from "@/hooks/useGameState";

type Props = {
  particles: Particle[];
  tileSize: number;
};

function ExplosionLayer({ particles, tileSize }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {particles.map((particle) => {
        const progress = 1 - particle.life / 0.5;
        const rise = progress * 14;
        const scale = 0.9 + progress * 0.8;
        return (
          <div
            key={particle.id}
            className="absolute text-lg"
            style={{
              left: particle.x * tileSize,
              top: particle.y * tileSize - rise,
              opacity: Math.max(0, particle.life / 0.5),
              transform: `scale(${scale})`,
              filter: "drop-shadow(0 0 10px rgba(34,211,238,0.6))",
            }}
          >
            {particle.emoji}
          </div>
        );
      })}
    </div>
  );
}

export default memo(ExplosionLayer);
