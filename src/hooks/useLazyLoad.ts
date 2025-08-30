import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useLazyLoad = (options: UseLazyLoadOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting) {
      setIsVisible(true);
      if (triggerOnce) {
        setHasTriggered(true);
      }
    } else if (!triggerOnce) {
      setIsVisible(false);
    }
  }, [triggerOnce]);

  useEffect(() => {
    const element = ref.current;
    if (!element || (triggerOnce && hasTriggered)) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleIntersection, threshold, rootMargin, triggerOnce, hasTriggered]);

  return { ref, isVisible };
};

// Specialized hook for image lazy loading
export const useLazyImage = (src: string, options?: UseLazyLoadOptions) => {
  const { ref, isVisible } = useLazyLoad(options);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isVisible && src) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        setHasError(false);
      };
      
      img.onerror = () => {
        setHasError(true);
        setIsLoaded(false);
      };
      
      img.src = src;
    }
  }, [isVisible, src]);

  return {
    ref,
    imageSrc,
    isLoaded,
    hasError,
    isVisible
  };
};

// Hook for progressive image loading
export const useProgressiveImage = (
  placeholderSrc: string,
  fullSrc: string,
  options?: UseLazyLoadOptions
) => {
  const { ref, isVisible } = useLazyLoad(options);
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
  const [isFullLoaded, setIsFullLoaded] = useState(false);

  useEffect(() => {
    if (isVisible && fullSrc) {
      const img = new Image();
      
      img.onload = () => {
        setCurrentSrc(fullSrc);
        setIsFullLoaded(true);
      };
      
      img.src = fullSrc;
    }
  }, [isVisible, fullSrc]);

  return {
    ref,
    currentSrc,
    isFullLoaded,
    isVisible
  };
};
