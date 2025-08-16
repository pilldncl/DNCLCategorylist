'use client';

import { useState, useEffect, useCallback } from 'react';

// Hook to get window dimensions
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once to set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Hook to detect if device is mobile
export const useIsMobile = () => {
  const { width } = useWindowSize();
  return width < 768; // Tailwind's sm breakpoint
};

// Hook to detect if device is tablet
export const useIsTablet = () => {
  const { width } = useWindowSize();
  return width >= 768 && width < 1024; // Tailwind's md to lg breakpoint
};

// Hook to detect if device is desktop
export const useIsDesktop = () => {
  const { width } = useWindowSize();
  return width >= 1024; // Tailwind's lg breakpoint
};

// Hook to get scroll position
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};

// Hook to detect if user is online
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Hook to detect if user prefers reduced motion
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook to detect if user prefers dark mode
export const usePrefersDarkMode = () => {
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersDarkMode(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersDarkMode;
};

// Hook to get user agent info
export const useUserAgent = () => {
  const [userAgent, setUserAgent] = useState({
    isChrome: false,
    isFirefox: false,
    isSafari: false,
    isEdge: false,
    isMobile: false,
    isIOS: false,
    isAndroid: false,
  });

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const ua = navigator.userAgent;
    setUserAgent({
      isChrome: /Chrome/.test(ua) && !/Edge/.test(ua),
      isFirefox: /Firefox/.test(ua),
      isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
      isEdge: /Edge/.test(ua),
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
      isIOS: /iPad|iPhone|iPod/.test(ua),
      isAndroid: /Android/.test(ua),
    });
  }, []);

  return userAgent;
};

// Hook to detect if element is in viewport
export const useInViewport = (ref: React.RefObject<Element>, options?: IntersectionObserverInit) => {
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isInViewport;
};

// Hook to handle keyboard shortcuts
export const useKeyboardShortcut = (
  key: string,
  callback: (event: KeyboardEvent) => void,
  options?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { ctrl = false, shift = false, alt = false } = options || {};
      
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt
      ) {
        event.preventDefault();
        callback(event);
      }
    },
    [key, callback, options]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Hook to detect if user is idle
export const useIdle = (timeout: number = 300000) => { // 5 minutes default
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let idleTimer: NodeJS.Timeout;

    const resetTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsIdle(true), timeout);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer, true);
    });

    resetTimer(); // Start the timer

    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer, true);
      });
    };
  }, [timeout]);

  return isIdle;
};

// Hook to get clipboard content
export const useClipboard = () => {
  const [clipboardText, setClipboardText] = useState('');

  const readClipboard = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        setClipboardText(text);
        return text;
      }
    } catch (error) {
      console.warn('Failed to read clipboard:', error);
    }
    return '';
  }, []);

  const writeClipboard = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setClipboardText(text);
        return true;
      }
    } catch (error) {
      console.warn('Failed to write to clipboard:', error);
    }
    return false;
  }, []);

  return { clipboardText, readClipboard, writeClipboard };
};
