'use client';

import React, { useState } from 'react';
import { trackContactFormSubmission } from '@/utils/contactTracking';

interface EmailInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  brand: string;
  grade: string;
  imageUrl?: string;
  emailAddress: string;
}

export default function EmailInquiryModal({
  isOpen,
  onClose,
  productName,
  brand,
  grade,
  imageUrl,
  emailAddress
}: EmailInquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Hi! I'm interested in ${productName} (${brand}).

Product Details:
- Grade: ${grade}

Can you provide pricing and availability information?`
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Track contact form submission
      await trackContactFormSubmission(productName, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        productName,
        brand,
        grade
      });

      // Try mailto first
      const subject = `Inquiry about ${productName}`;
      let body = formData.message;
      
      if (imageUrl) {
        body += `\n\nProduct Image: ${imageUrl}`;
      }

      const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Try to open mailto
      const mailtoWindow = window.open(mailtoUrl);
      
      // If mailto fails or user cancels, show success message anyway
      setTimeout(() => {
        if (mailtoWindow && mailtoWindow.closed) {
          setSubmitStatus('success');
        } else {
          setSubmitStatus('success');
        }
        setIsSubmitting(false);
      }, 1000);

    } catch (error) {
      console.error('Email submission error:', error);
      setSubmitStatus('error');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const copyToClipboard = async () => {
    const subject = `Inquiry about ${productName}`;
    let body = formData.message;
    
    if (imageUrl) {
      body += `\n\nProduct Image: ${imageUrl}`;
    }

    const emailText = `To: ${emailAddress}\nSubject: ${subject}\n\n${body}`;
    
    try {
      await navigator.clipboard.writeText(emailText);
      alert('Email content copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Email Inquiry</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Product:</p>
                <p className="font-medium">{productName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Brand:</p>
                <p className="font-medium">{brand}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Grade:</p>
                <p className="font-medium">{grade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email To:</p>
                <p className="font-medium text-blue-600">{emailAddress}</p>
              </div>
            </div>
            {imageUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Product Image:</p>
                <img 
                  src={imageUrl} 
                  alt={productName}
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your message"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isSubmitting ? 'Sending...' : 'Send Email Inquiry'}
              </button>
              
              <button
                type="button"
                onClick={copyToClipboard}
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 font-medium transition-colors"
              >
                Copy to Clipboard
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-800 font-medium">
                  Email inquiry prepared! Your email client should open with the inquiry details.
                </p>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">
                  There was an issue sending the email. Please try copying to clipboard instead.
                </p>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How this works:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• We'll try to open your default email client with the inquiry pre-filled</li>
              <li>• If that doesn't work, you can copy the email content to your clipboard</li>
              <li>• Then paste it into your preferred email application</li>
              <li>• The inquiry will be sent to: <strong>{emailAddress}</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

