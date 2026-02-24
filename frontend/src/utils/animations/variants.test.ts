import { describe, it, expect } from 'vitest';
import {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  staggerContainer,
  createFadeVariant
} from './variants';

describe('Animation Variants', () => {
  describe('fadeInUp', () => {
    it('should have correct hidden state', () => {
      expect(fadeInUp.hidden).toEqual({ opacity: 0, y: 60 });
    });

    it('should have correct visible state', () => {
      expect(fadeInUp.visible).toMatchObject({
        opacity: 1,
        y: 0
      });
    });

    it('should have valid transition timing', () => {
      const visible = fadeInUp.visible as any;
      expect(visible.transition.duration).toBeGreaterThan(0);
      expect(visible.transition.ease).toBe('easeOut');
    });
  });

  describe('fadeInDown', () => {
    it('should have correct hidden state with negative y', () => {
      expect(fadeInDown.hidden).toEqual({ opacity: 0, y: -60 });
    });

    it('should have correct visible state', () => {
      expect(fadeInDown.visible).toMatchObject({
        opacity: 1,
        y: 0
      });
    });
  });

  describe('fadeInLeft', () => {
    it('should have correct hidden state with negative x', () => {
      expect(fadeInLeft.hidden).toEqual({ opacity: 0, x: -60 });
    });

    it('should have correct visible state', () => {
      expect(fadeInLeft.visible).toMatchObject({
        opacity: 1,
        x: 0
      });
    });
  });

  describe('fadeInRight', () => {
    it('should have correct hidden state with positive x', () => {
      expect(fadeInRight.hidden).toEqual({ opacity: 0, x: 60 });
    });

    it('should have correct visible state', () => {
      expect(fadeInRight.visible).toMatchObject({
        opacity: 1,
        x: 0
      });
    });
  });

  describe('scaleIn', () => {
    it('should have correct hidden state with scale', () => {
      expect(scaleIn.hidden).toEqual({ opacity: 0, scale: 0.8 });
    });

    it('should have correct visible state', () => {
      expect(scaleIn.visible).toMatchObject({
        opacity: 1,
        scale: 1
      });
    });

    it('should have valid transition timing', () => {
      const visible = scaleIn.visible as any;
      expect(visible.transition.duration).toBeGreaterThan(0);
      expect(visible.transition.duration).toBeLessThanOrEqual(1);
    });
  });

  describe('staggerContainer', () => {
    it('should have correct structure', () => {
      expect(staggerContainer.hidden).toEqual({ opacity: 0 });
      expect(staggerContainer.visible).toMatchObject({ opacity: 1 });
    });

    it('should have stagger configuration', () => {
      const visible = staggerContainer.visible as any;
      expect(visible.transition.staggerChildren).toBeGreaterThan(0);
      expect(visible.transition.delayChildren).toBeGreaterThanOrEqual(0);
    });

    it('should have valid stagger timing values', () => {
      const visible = staggerContainer.visible as any;
      expect(visible.transition.staggerChildren).toBe(0.15);
      expect(visible.transition.delayChildren).toBe(0.1);
    });
  });

  describe('createFadeVariant', () => {
    it('should create variant with up direction', () => {
      const variant = createFadeVariant('up');
      expect(variant.hidden).toEqual({ opacity: 0, y: 60 });
      expect(variant.visible).toMatchObject({ opacity: 1, x: 0, y: 0 });
    });

    it('should create variant with down direction', () => {
      const variant = createFadeVariant('down');
      expect(variant.hidden).toEqual({ opacity: 0, y: -60 });
    });

    it('should create variant with left direction', () => {
      const variant = createFadeVariant('left');
      expect(variant.hidden).toEqual({ opacity: 0, x: -60 });
    });

    it('should create variant with right direction', () => {
      const variant = createFadeVariant('right');
      expect(variant.hidden).toEqual({ opacity: 0, x: 60 });
    });

    it('should accept custom distance', () => {
      const variant = createFadeVariant('up', 100);
      expect(variant.hidden).toEqual({ opacity: 0, y: 100 });
    });

    it('should accept custom duration', () => {
      const variant = createFadeVariant('up', 60, 1.2);
      const visible = variant.visible as any;
      expect(visible.transition.duration).toBe(1.2);
    });

    it('should handle zero distance', () => {
      const variant = createFadeVariant('up', 0);
      expect(variant.hidden).toEqual({ opacity: 0, y: 0 });
    });

    it('should have valid timing values', () => {
      const variant = createFadeVariant('up', 60, 0.6);
      const visible = variant.visible as any;
      expect(visible.transition.duration).toBeGreaterThan(0);
      expect(visible.transition.ease).toBe('easeOut');
    });
  });

  describe('Variant Structure Validation', () => {
    it('all variants should have hidden and visible states', () => {
      const variants = [fadeInUp, fadeInDown, fadeInLeft, fadeInRight, scaleIn, staggerContainer];
      
      variants.forEach(variant => {
        expect(variant).toHaveProperty('hidden');
        expect(variant).toHaveProperty('visible');
      });
    });

    it('all fade variants should start with opacity 0', () => {
      const fadeVariants = [fadeInUp, fadeInDown, fadeInLeft, fadeInRight];
      
      fadeVariants.forEach(variant => {
        expect((variant.hidden as any).opacity).toBe(0);
      });
    });

    it('all fade variants should end with opacity 1', () => {
      const fadeVariants = [fadeInUp, fadeInDown, fadeInLeft, fadeInRight];
      
      fadeVariants.forEach(variant => {
        expect((variant.visible as any).opacity).toBe(1);
      });
    });
  });
});
