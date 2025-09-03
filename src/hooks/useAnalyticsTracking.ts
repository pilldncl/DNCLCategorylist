import { useCallback, useMemo } from 'react';

/**
 * Analytics Tracking Hook
 * Consolidates all user interaction tracking to the analytics system
 */
export function useAnalyticsTracking() {
  // Generate session ID for tracking
  const sessionId = useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('analytics_session_id') || 
             `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Store session ID
  useMemo(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics_session_id', sessionId);
    }
  }, [sessionId]);

  // Track page view
  const trackPageView = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'page_view',
          sessionId,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Analytics tracking failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Don't throw error, just log it for now
        // throw new Error(`HTTP error! status: ${response.status}`);
        return;
      }

      const result = await response.json();
      console.log('📊 Page view tracked:', result);
    } catch (err) {
      console.error('Error tracking page view:', err);
    }
  }, [sessionId]);

  // Track category view
  const trackCategoryView = useCallback(async (category: string) => {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'category_view',
          sessionId,
          timestamp: new Date().toISOString(),
          brand: category // Map category to brand field
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Category view tracking failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return;
      }

      const result = await response.json();
      console.log('📊 Category view tracked:', result);
    } catch (err) {
      console.error('Error tracking category view:', err);
    }
  }, [sessionId]);

  // Track product view
  const trackProductView = useCallback(async (productId: string, brand?: string) => {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'product_view',
          productId,
          sessionId,
          timestamp: new Date().toISOString(),
          brand
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Product view tracking failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return;
      }

      const result = await response.json();
      console.log('📊 Product view tracked:', result);
    } catch (err) {
      console.error('Error tracking product view:', err);
    }
  }, [sessionId]);

  // Track result click
  const trackResultClick = useCallback(async (productId: string, brand?: string) => {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'result_click',
          productId,
          sessionId,
          timestamp: new Date().toISOString(),
          brand
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Result click tracking failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return;
      }

      const result = await response.json();
      console.log('📊 Result click tracked:', result);
    } catch (err) {
      console.error('Error tracking result click:', err);
    }
  }, [sessionId]);

  // Track search
  const trackSearch = useCallback(async (searchTerm: string) => {
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'search',
          sessionId,
          timestamp: new Date().toISOString(),
          searchTerm
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Search tracking failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return;
      }

      const result = await response.json();
      console.log('📊 Search tracked:', result);
    } catch (err) {
      console.error('Error tracking search:', err);
    }
  }, [sessionId]);

  return {
    sessionId,
    trackPageView,
    trackCategoryView,
    trackProductView,
    trackResultClick,
    trackSearch
  };
}
