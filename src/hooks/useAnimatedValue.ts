import { useState, useEffect, useRef } from 'react';

export function useAnimatedValue(target: number, duration = 900): number {
  const [v, setV] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) { setV(target); return; }
    let raf: number;
    let landed = false;
    const start = performance.now();

    const tick = (now: number) => {
      if (landed) return;
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3); // cubic ease out
      setV(from + (target - from) * ease);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        landed = true;
        fromRef.current = target;
        setV(target);
      }
    };

    raf = requestAnimationFrame(tick);
    const fallback = setTimeout(() => {
      if (!landed) { landed = true; fromRef.current = target; setV(target); }
    }, duration + 150);

    return () => { cancelAnimationFrame(raf); clearTimeout(fallback); };
  }, [target, duration]);

  return v;
}

// ─── Real-time clock hook ─────────────────────────────────────────────
export function useClock(): string {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`);
    };
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  return time;
}
