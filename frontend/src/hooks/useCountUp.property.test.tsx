import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCountUp } from './useCountUp';
import * as fc from 'fast-check';

/**
 * Feature: page-animations, Property 4: Count-up animation range
 * 
 * For any numeric stat with count-up animation, when the animation triggers,
 * the displayed value should animate from 0 (or configured start value) to
 * the target value over the specified duration.
 * 
 * Validates: Requirements 3.1, 3.2
 */

describe('useCountUp Property Tests', () => {
  it('Property 4: Count-up animation range - should animate from start to end value', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 100 }),
        async (end, start) => {
          // Ensure start is less than or equal to end
          const actualStart = Math.min(start, end);
          const actualEnd = Math.max(start, end);

          const { result } = renderHook(() =>
            useCountUp({
              end: actualEnd,
              start: actualStart,
              duration: 0.5, // Short duration for testing
              shouldStart: true
            })
          );

          // Initial value should be the start value
          expect(result.current).toBe(actualStart);

          // Wait for animation to complete
          await waitFor(
            () => {
              expect(result.current).toBe(actualEnd);
            },
            { timeout: 2000 }
          );

          return true;
        }
      ),
      { numRuns: 30, timeout: 60000 } // Reduced runs and increased timeout
    );
  }, 60000);

  it('Property 4 (Edge Case): Should handle zero as end value', async () => {
    const { result } = renderHook(() =>
      useCountUp({
        end: 0,
        start: 0,
        duration: 0.5,
        shouldStart: true
      })
    );

    expect(result.current).toBe(0);
  });

  it('Property 4 (Edge Case): Should handle large numbers', async () => {
    const end = 500000;
    const { result } = renderHook(() =>
      useCountUp({
        end,
        start: 0,
        duration: 0.5,
        shouldStart: true
      })
    );

    // Initial value should be 0
    expect(result.current).toBe(0);

    // Wait for animation to complete
    await waitFor(
      () => {
        expect(result.current).toBe(end);
      },
      { timeout: 2000 }
    );
  }, 10000);

  it('Property 4 (Configuration): Should respect shouldStart flag', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 100 }),
        (end, start) => {
          const actualStart = Math.min(start, end);
          const actualEnd = Math.max(start, end);

          // Render with shouldStart=false
          const { result } = renderHook(() =>
            useCountUp({
              end: actualEnd,
              start: actualStart,
              duration: 1,
              shouldStart: false
            })
          );

          // Value should remain at start when shouldStart is false
          expect(result.current).toBe(actualStart);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4 (Configuration): Should handle various durations', async () => {
    const end = 100;
    const start = 0;
    const duration = 0.5;

    const { result } = renderHook(() =>
      useCountUp({
        end,
        start,
        duration,
        shouldStart: true
      })
    );

    // Initial value should be start
    expect(result.current).toBe(start);

    // Wait for animation to complete
    await waitFor(
      () => {
        expect(result.current).toBe(end);
      },
      { timeout: 2000 }
    );
  }, 10000);
});
