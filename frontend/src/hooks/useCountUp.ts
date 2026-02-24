import React, { useEffect, useState } from 'react';
import { useMotionValue, useTransform, animate, MotionValue } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';

export interface UseCountUpOptions {
  end: number;
  duration?: number;
  start?: number;
  shouldStart: boolean;
}

export function useCountUp({
  end,
  duration = 2,
  start = 0,
  shouldStart
}: UseCountUpOptions): number {
  const [currentValue, setCurrentValue] = useState(start);
  const prefersReducedMotion = useReducedMotion();
  const count = useMotionValue(start);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (shouldStart) {
      // If user prefers reduced motion, instantly show final value
      if (prefersReducedMotion) {
        setCurrentValue(end);
        return;
      }

      const controls = animate(count, end, {
        duration,
        ease: 'easeOut'
      });

      return () => controls.stop();
    } else {
      count.set(start);
    }
  }, [shouldStart, end, duration, count, start, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return; // Skip animation subscription if reduced motion is preferred
    }

    const unsubscribe = rounded.on('change', (latest) => {
      setCurrentValue(latest);
    });

    return unsubscribe;
  }, [rounded, prefersReducedMotion]);

  return currentValue;
}
