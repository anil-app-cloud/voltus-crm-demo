import React, { ReactNode, useEffect, useState } from 'react';
import { cn } from "../../lib/utils";

export type AnimationType = 'fade' | 'slide' | 'scale' | 'pop' | 'pulse' | 'shake' | 'bounce';

interface AnimateProps {
  children: ReactNode;
  type?: AnimationType;
  delay?: number;
  duration?: number;
  repeat?: boolean;
  className?: string;
}

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

interface SlideInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

// Base animation component
export const Animate: React.FC<AnimateProps> = ({
  children,
  type = 'fade',
  delay = 0,
  duration = 500,
  repeat = false,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  // Map animation types to class names
  const animationClass = {
    fade: 'animate-fade-in',
    slide: 'animate-slide-in-bottom',
    scale: 'animate-scale-in',
    pop: 'animate-pop',
    pulse: 'animate-pulse-soft',
    shake: 'animate-shake',
    bounce: 'animate-bounce-subtle',
  }[type];

  const durationClass = `duration-${duration}`;
  const repeatClass = repeat ? 'animation-iteration-count-infinite' : '';

  // Apply animation style with delay
  const style = {
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`,
    opacity: isVisible ? 1 : 0,
  };

  return (
    <div
      className={`${animationClass} ${durationClass} ${repeatClass} ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

// Specialized animation components
export const FadeIn: React.FC<FadeInProps> = ({ 
  children,
  delay = 0, 
  duration = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`animate-fadeIn ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};

export const SlideInTop: React.FC<SlideInProps> = ({ 
  children,
  delay = 0, 
  duration = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`animate-slide-in-top ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};

export const SlideInBottom: React.FC<SlideInProps> = ({ 
  children,
  delay = 0, 
  duration = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`animate-slideInBottom ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};

export const SlideInLeft: React.FC<SlideInProps> = ({ 
  children,
  delay = 0, 
  duration = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`animate-slide-in-left ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};

export const SlideInRight: React.FC<SlideInProps> = ({ 
  children,
  delay = 0, 
  duration = 500,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`animate-slide-in-right ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};

export default Animate; 