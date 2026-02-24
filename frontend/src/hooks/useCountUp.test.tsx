import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCountUp } from './useCountUp';

describe('useCountUp', () => {
  it('should return initial value when shouldStart is false', () => {
    const { result } = renderHook(() =>
      useCountUp({
        end: 100,
        start: 0,
        duration: 1,
        shouldStart: false
      })
    );

    expect(result.current).toBe(0);
  });

  it('should animate to end value when shouldStart is true', async () => {
    const { result } = renderHook(() =>
      useCountUp({
        end: 100,
        start: 0,
        duration: 0.5,
        shouldStart: true
      })
    );

    expect(result.current).toBe(0);

    await waitFor(
      () => {
        expect(result.current).toBe(100);
      },
      { timeout: 2000 }
    );
  });

  it('should handle zero duration', async () => {
    const { result } = renderHook(() =>
      useCountUp({
        end: 100,
        start: 0,
        duration: 0,
        shouldStart: true
      })
    );

    // With zero duration, should immediately show end value
    await waitFor(
      () => {
        expect(result.current).toBe(100);
      },
      { timeout: 500 }
    );
  });

  it('should cleanup animation on unmount', () => {
    const { unmount } = renderHook(() =>
      useCountUp({
        end: 100,
        start: 0,
        duration: 2,
        shouldStart: true
      })
    );

    // Should not throw error on unmount
    expect(() => unmount()).not.toThrow();
  });

  it('should use default duration when not provided', async () => {
    const { result } = renderHook(() =>
      useCountUp({
        end: 100,
        start: 0,
        shouldStart: true
      })
    );

    expect(result.current).toBe(0);

    // Default duration is 2 seconds
    await waitFor(
      () => {
        expect(result.current).toBe(100);
      },
      { timeout: 3000 }
    );
  });

  it('should use default start value of 0 when not provided', async () => {
    const { result } = renderHook(() =>
      useCountUp({
        end: 50,
        duration: 0.5,
        shouldStart: true
      })
    );

    expect(result.current).toBe(0);

    await waitFor(
      () => {
        expect(result.current).toBe(50);
      },
      { timeout: 2000 }
    );
  });

  it('should handle custom start value', async () => {
    const { result } = renderHook(() =>
      useCountUp({
        end: 100,
        start: 50,
        duration: 0.5,
        shouldStart: true
      })
    );

    expect(result.current).toBe(50);

    await waitFor(
      () => {
        expect(result.current).toBe(100);
      },
      { timeout: 2000 }
    );
  });

  it('should handle same start and end values', () => {
    const { result } = renderHook(() =>
      useCountUp({
        end: 50,
        start: 50,
        duration: 0.5,
        shouldStart: true
      })
    );

    expect(result.current).toBe(50);
  });

  it('should restart animation when shouldStart changes from false to true', async () => {
    const { result, rerender } = renderHook(
      ({ shouldStart }) =>
        useCountUp({
          end: 100,
          start: 0,
          duration: 0.5,
          shouldStart
        }),
      { initialProps: { shouldStart: false } }
    );

    expect(result.current).toBe(0);

    // Change shouldStart to true
    rerender({ shouldStart: true });

    await waitFor(
      () => {
        expect(result.current).toBe(100);
      },
      { timeout: 2000 }
    );
  });
});
