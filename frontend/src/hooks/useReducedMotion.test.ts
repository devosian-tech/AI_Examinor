import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Feature: page-animations, Property 8: Reduced motion compliance
 * 
 * For any animation in the system, when the user has "prefers-reduced-motion"
 * enabled in system settings, animations should either be disabled entirely
 * or reduced to simple opacity transitions.
 * 
 * Validates: Requirements 7.1
 */

describe('useReducedMotion', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    };

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => matchMediaMock)
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Property 8: Should return false when prefers-reduced-motion is not set', () => {
    matchMediaMock.matches = false;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it('Property 8: Should return true when prefers-reduced-motion is enabled', () => {
    matchMediaMock.matches = true;

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it('Property 8: Should register event listener for changes', () => {
    renderHook(() => useReducedMotion());

    expect(matchMediaMock.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('Property 8: Should cleanup event listener on unmount', () => {
    const { unmount } = renderHook(() => useReducedMotion());

    unmount();

    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('Property 8: Should handle missing matchMedia gracefully', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: undefined
    });

    const { result } = renderHook(() => useReducedMotion());

    // Should default to false when matchMedia is not available
    expect(result.current).toBe(false);
  });

  it('Property 8: Should use fallback addListener for older browsers', () => {
    matchMediaMock.addEventListener = undefined;

    renderHook(() => useReducedMotion());

    expect(matchMediaMock.addListener).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });
});
