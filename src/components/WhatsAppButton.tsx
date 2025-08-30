'use client';

import { useState } from 'react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  position?: 'fixed' | 'inline';
  showText?: boolean;
}

export default function WhatsAppButton({
  phoneNumber,
  message = "Hi! I'm interested in your products. Can you help me?",
  className = '',
  size = 'medium',
  position = 'fixed',
  showText = true
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Format phone number (remove any non-digit characters)
  const formattedPhone = phoneNumber.replace(/\D/g, '');
  
  // Create WhatsApp URL
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    // Open WhatsApp in new tab/window
    window.open(whatsappUrl, '_blank');
  };

  // Size classes
  const sizeClasses = {
    small: 'w-10 h-10 text-sm',
    medium: 'w-12 h-12 text-base',
    large: 'w-16 h-16 text-lg'
  };

  // Position classes
  const positionClasses = {
    fixed: 'fixed bottom-6 right-6 z-50',
    inline: 'inline-block'
  };

  // Text size classes
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${sizeClasses[size]}
          bg-green-500 hover:bg-green-600 
          text-white rounded-full shadow-lg 
          flex items-center justify-center 
          transition-all duration-300 ease-in-out
          transform hover:scale-110 hover:shadow-xl
          focus:outline-none focus:ring-4 focus:ring-green-300
        `}
        aria-label="Contact us on WhatsApp"
        title="Chat with us on WhatsApp"
      >
        {/* WhatsApp Icon */}
        <svg 
          className="w-6 h-6" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </button>

      {/* Floating text tooltip */}
      {showText && isHovered && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap">
          Chat with us on WhatsApp
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

// Floating WhatsApp button component (most common use case)
export function FloatingWhatsAppButton({ 
  phoneNumber, 
  message,
  className = ''
}: {
  phoneNumber: string;
  message?: string;
  className?: string;
}) {
  return (
    <WhatsAppButton
      phoneNumber={phoneNumber}
      message={message}
      position="fixed"
      size="large"
      showText={true}
      className={className}
    />
  );
}

// Inline WhatsApp button component
export function InlineWhatsAppButton({ 
  phoneNumber, 
  message,
  size = 'medium',
  className = ''
}: {
  phoneNumber: string;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  return (
    <WhatsAppButton
      phoneNumber={phoneNumber}
      message={message}
      position="inline"
      size={size}
      showText={false}
      className={className}
    />
  );
}
