// Animation configuration types

export interface AnimationConfig {
  // Timing
  duration: number;        // Animation duration in seconds
  delay: number;          // Delay before animation starts
  stagger: number;        // Delay between child animations
  
  // Easing
  ease: string | number[]; // Easing function
  
  // Viewport detection
  threshold: number;       // Percentage of element visible to trigger
  once: boolean;          // Animate only once or every time
  
  // Performance
  reducedMotion: boolean;  // Respect prefers-reduced-motion
}

export interface MotionSettings {
  initial: MotionVariant;
  animate: MotionVariant;
  exit?: MotionVariant;
  transition: Transition;
  whileHover?: MotionVariant;
  whileTap?: MotionVariant;
}

export type MotionVariant = {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  [key: string]: any;
};

export interface Transition {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  staggerChildren?: number;
  delayChildren?: number;
  [key: string]: any;
}

export type AnimationDirection = 'up' | 'down' | 'left' | 'right';
