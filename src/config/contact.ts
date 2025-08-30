// Contact Configuration
// Update these values with your actual contact information

export const CONTACT_CONFIG = {
  // WhatsApp Configuration
  whatsapp: {
    phoneNumber: '+16825616897', // Your actual phone number
    defaultMessage: "Hi! I'm interested in your wholesale products. Can you help me with pricing and availability?",
    businessHours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
  },
  
  // General Contact Information
  contact: {
    phone: '+16825616897',
    email: 'info@dncltechzone.com',
    address: 'Your Business Address Here',
    website: 'https://dncltechzone.com',
  },
  
  // Social Media Links
  social: {
    facebook: 'https://facebook.com/dncltechzone',
    instagram: 'https://instagram.com/dncltechzone',
    twitter: 'https://twitter.com/dncltechzone',
    linkedin: 'https://linkedin.com/company/dncltechzone',
  },
  
  // Business Information
  business: {
    name: 'DNCL-TECHZONE',
    description: 'Wholesale Technology Products',
    founded: '2024',
    location: 'Your City, State',
  }
};

// WhatsApp URL generator
export function generateWhatsAppUrl(phoneNumber: string, message?: string): string {
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  const defaultMessage = CONTACT_CONFIG.whatsapp.defaultMessage;
  const finalMessage = message || defaultMessage;
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(finalMessage)}`;
}

// Phone number formatter
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }
  
  return phoneNumber;
}
