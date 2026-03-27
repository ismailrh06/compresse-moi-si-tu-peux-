"use client";

import { Explosion } from "../hooks/useGame";

type Props = {
  explosions: Explosion[];
  remove: (id: number) => void;
};

export default function ExplosionLayer({ explosions, remove }: Props) {
  return (
    <>
      {explosions.map((exp) => (
        <div
          key={exp.id}
          className="pointer-events-none absolute text-4xl"
          style={{
            left: `${exp.x}%`,
            top: `${exp.y}%`,
            animation: "explosion 0.6s ease-out forwards",
          }}
          onAnimationEnd={() => remove(exp.id)}
        >
          💥
        </div>
      ))}
      <style>{`
        @keyframes explosion {
          0%   { transform: scale(0);   opacity: 1; }
          60%  { transform: scale(2.5); opacity: 0.8; }
          100% { transform: scale(3);   opacity: 0; }
        }
      `}</style>
    </>
  );
}