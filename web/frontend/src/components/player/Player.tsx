import { memo } from "react";

type Props = {
  x: number;
  y: number;
  tileSize: number;
  scale: number;
};

function Player({ x, y, tileSize, scale }: Props) {
  const spriteSize = Math.max(20, Math.round(tileSize * 0.8));
  const spriteFont = Math.max(18, Math.round(tileSize * 0.62));
  return (
    <div
      className="absolute z-20 flex items-center justify-center transition-transform duration-75 will-change-transform"
      style={{
        left: x * tileSize,
        top: y * tileSize,
        width: spriteSize,
        height: spriteSize,
        fontSize: spriteFont,
        transform: `scale(${Math.min(2, scale)})`,
        transformOrigin: "center center",
        filter: "drop-shadow(0 0 10px rgba(34,211,238,0.8))",
      }}
    >
      👾
    </div>
  );
}

export default memo(Player);
