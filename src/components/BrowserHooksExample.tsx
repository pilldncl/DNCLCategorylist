'use client';

import { useRef } from 'react';
import {
  useWindowSize,
  useIsMobile,
  useIsDesktop,
  useScrollPosition,
  useOnlineStatus,
  usePrefersReducedMotion,
  usePrefersDarkMode,
  useUserAgent,
  useInViewport,
  useKeyboardShortcut,
  useIdle,
  useClipboard
} from '@/hooks/useBrowser';

export default function BrowserHooksExample() {
  const elementRef = useRef<HTMLDivElement>(null);
  const isInViewport = useInViewport(elementRef);
  
  // Use the hooks
  const { width, height } = useWindowSize();
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const scrollPosition = useScrollPosition();
  const isOnline = useOnlineStatus();
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersDarkMode = usePrefersDarkMode();
  const userAgent = useUserAgent();
  const isIdle = useIdle(60000); // 1 minute
  const { clipboardText, writeClipboard } = useClipboard();

  // Keyboard shortcut example
  useKeyboardShortcut('k', () => {
    console.log('K key pressed!');
  }, { ctrl: true });

  const handleCopyToClipboard = () => {
    writeClipboard('DNCL-TECHZONE Catalog - Check out our products!');
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 rounded-lg">
      <h2 className="text-lg font-semibold">Browser Hooks Demo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <p><strong>Window Size:</strong> {width} × {height}</p>
          <p><strong>Device:</strong> {isMobile ? 'Mobile' : isDesktop ? 'Desktop' : 'Tablet'}</p>
          <p><strong>Scroll Position:</strong> {scrollPosition}px</p>
          <p><strong>Online Status:</strong> {isOnline ? '🟢 Online' : '🔴 Offline'}</p>
        </div>
        
        <div className="space-y-2">
          <p><strong>Reduced Motion:</strong> {prefersReducedMotion ? 'Yes' : 'No'}</p>
          <p><strong>Dark Mode:</strong> {prefersDarkMode ? 'Preferred' : 'Light'}</p>
          <p><strong>Browser:</strong> {
            userAgent.isChrome ? 'Chrome' :
            userAgent.isFirefox ? 'Firefox' :
            userAgent.isSafari ? 'Safari' :
            userAgent.isEdge ? 'Edge' : 'Other'
          }</p>
          <p><strong>User Idle:</strong> {isIdle ? '🟡 Idle' : '🟢 Active'}</p>
        </div>
      </div>

      <div ref={elementRef} className={`p-4 rounded border-2 ${
        isInViewport ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-100'
      }`}>
        <p><strong>Viewport Detection:</strong> {isInViewport ? 'In viewport' : 'Out of viewport'}</p>
        <p className="text-xs text-gray-600">Scroll to see this element enter/leave the viewport</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleCopyToClipboard}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Copy DNCL-TECHZONE to Clipboard
        </button>
        {clipboardText && (
          <p className="text-sm text-gray-600">
            <strong>Clipboard:</strong> {clipboardText}
          </p>
        )}
      </div>

      <div className="text-xs text-gray-500">
        <p><strong>Keyboard Shortcut:</strong> Press Ctrl+K to see a console log</p>
      </div>
    </div>
  );
}
