"use client";

import { useEffect, useRef } from "react";

export function useGameLoop(callback: (deltaSeconds: number) => void, enabled: boolean): void {
  const frameRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      const last = lastRef.current ?? timestamp;
      const deltaSeconds = Math.min(0.05, (timestamp - last) / 1000);
      lastRef.current = timestamp;

      callbackRef.current(deltaSeconds);
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = null;
      lastRef.current = null;
    };
  }, [enabled]);
}
