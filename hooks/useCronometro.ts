import { useEffect, useRef, useState } from 'react';

// Hook de cronometro regressivo para descanso.
export function useCronometro(initialSeconds: number) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
      setRunning(false);
    }
  }, [remaining]);

  const start = (seconds?: number) => {
    if (seconds !== undefined) setRemaining(seconds);
    setRunning(true);
  };

  const pause = () => setRunning(false);
  const reset = (seconds = initialSeconds) => {
    setRemaining(seconds);
    setRunning(false);
  };
  const skip = () => {
    setRemaining(0);
    setRunning(false);
  };

  return { remaining, running, start, pause, reset, skip };
}
