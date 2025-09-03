/**
 * Contact Tracking Utilities
 * Simple functions to track lead generation activities
 */

/**
 * Get or create a session ID
 */
function getSessionId(): string {
  if (typeof window !== 'undefined') {
    let sessionId = localStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Track contact form submission
 * @param productId - Optional product ID for context
 * @param formData - Optional form data
 */
export const trackContactFormSubmission = async (productId?: string, formData?: any) => {
  try {
    // Create a unique session ID if not exists
    const sessionId = getSessionId();
    
    // Track the interaction directly to the analytics API
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'contact_form_submitted',
        productId,
        sessionId,
        timestamp: new Date().toISOString(),
        metadata: formData
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Contact form tracking failed:', { 
        status: response.status, 
        statusText: response.statusText, 
        error: errorText 
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Contact form submission tracked:', { productId, formData, result });
  } catch (error) {
    console.error('❌ Failed to track contact form submission:', error);
  }
};

/**
 * Track phone number click
 * @param productId - Optional product ID for context
 * @param phoneNumber - The phone number that was clicked
 */
export const trackPhoneClick = async (productId?: string, phoneNumber?: string) => {
  try {
    // Create a unique session ID if not exists
    const sessionId = getSessionId();
    
    // Track the interaction directly to the analytics API
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'phone_clicked',
        productId,
        sessionId,
        timestamp: new Date().toISOString(),
        metadata: { phoneNumber }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('📞 Phone click tracked:', { productId, phoneNumber, result });
  } catch (error) {
    console.error('Failed to track phone click:', error);
  }
};

/**
 * Track WhatsApp click
 * @param productId - Optional product ID for context
 * @param whatsappNumber - The WhatsApp number that was clicked
 */
export const trackWhatsAppClick = async (productId?: string, whatsappNumber?: string) => {
  try {
    // Create a unique session ID if not exists
    const sessionId = getSessionId();
    
    // Track the interaction directly to the analytics API
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'whatsapp_clicked',
        productId,
        sessionId,
        timestamp: new Date().toISOString(),
        metadata: { whatsappNumber }
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ WhatsApp tracking failed:', { 
        status: response.status, 
        statusText: response.statusText, 
        error: errorText 
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ WhatsApp click tracked:', { productId, whatsappNumber, result });
  } catch (error) {
    console.error('❌ Failed to track WhatsApp click:', error);
  }
};

/**
 * Check if contact tracking is enabled
 */
export const isContactTrackingEnabled = (): boolean => {
  // You can add environment variable checks here
  return process.env.NODE_ENV === 'production' || process.env.ENABLE_CONTACT_TRACKING === 'true';
};
