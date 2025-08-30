# WhatsApp Integration Guide

## 🎯 Overview

Your website now has a floating WhatsApp button that allows customers to contact you directly through WhatsApp. The button appears on all pages and opens the user's WhatsApp app with a pre-filled message.

## 🔧 Setup Instructions

### 1. Update Your Phone Number

Edit the file `src/config/contact.ts` and update your phone number:

```typescript
export const CONTACT_CONFIG = {
  whatsapp: {
    phoneNumber: '+1234567890', // ← Replace with your actual phone number
    defaultMessage: "Hi! I'm interested in your wholesale products. Can you help me with pricing and availability?",
    businessHours: "Mon-Fri: 9AM-6PM, Sat: 10AM-4PM",
  },
  // ... other config
};
```

### 2. Customize the Default Message

You can also customize the default message that appears when users click the button:

```typescript
defaultMessage: "Hi! I'm interested in your wholesale products. Can you help me with pricing and availability?",
```

### 3. Update Other Contact Information

While you're in the config file, update your other business information:

```typescript
contact: {
  phone: '+1234567890',
  email: 'info@dncl-techzone.com',
  address: 'Your Business Address Here',
  website: 'https://dncl-techzone.com',
},
```

## 🎨 Features

### Floating WhatsApp Button
- **Position**: Fixed bottom-right corner of every page
- **Size**: Large, easy to click
- **Hover Effect**: Scales up and shows tooltip
- **Accessibility**: Keyboard navigation support
- **Mobile Friendly**: Works perfectly on mobile devices

### Visual Features
- ✅ **WhatsApp Green Color**: Official WhatsApp brand color
- ✅ **Smooth Animations**: Hover effects and transitions
- ✅ **Tooltip**: Shows "Chat with us on WhatsApp" on hover
- ✅ **Responsive**: Works on all screen sizes
- ✅ **High Z-Index**: Always visible above other content

## 📱 How It Works

### For Users:
1. **Click the green WhatsApp button** (bottom-right corner)
2. **WhatsApp opens** (app or web version)
3. **Pre-filled message** appears with your business info
4. **User can edit** the message before sending
5. **Direct conversation** starts with your business

### Technical Details:
- Uses `https://wa.me/` API
- Automatically formats phone numbers
- URL-encodes messages for proper transmission
- Opens in new tab/window for better UX

## 🛠️ Customization Options

### Different Button Types

#### 1. Floating Button (Current Implementation)
```tsx
import { FloatingWhatsAppButton } from '@/components/WhatsAppButton';

<FloatingWhatsAppButton 
  phoneNumber="+1234567890"
  message="Custom message here"
/>
```

#### 2. Inline Button
```tsx
import { InlineWhatsAppButton } from '@/components/WhatsAppButton';

<InlineWhatsAppButton 
  phoneNumber="+1234567890"
  size="medium"
/>
```

#### 3. Custom Button
```tsx
import WhatsAppButton from '@/components/WhatsAppButton';

<WhatsAppButton 
  phoneNumber="+1234567890"
  message="Custom message"
  size="large"
  position="inline"
  showText={true}
/>
```

### Size Options
- `small`: 40px × 40px
- `medium`: 48px × 48px (default)
- `large`: 64px × 64px

### Position Options
- `fixed`: Floating button (bottom-right)
- `inline`: Regular button in page flow

## 📊 Analytics & Tracking

### Track WhatsApp Clicks
You can add analytics tracking by modifying the `handleClick` function in `WhatsAppButton.tsx`:

```typescript
const handleClick = () => {
  // Add analytics tracking here
  if (typeof gtag !== 'undefined') {
    gtag('event', 'whatsapp_click', {
      'event_category': 'engagement',
      'event_label': 'floating_button'
    });
  }
  
  // Open WhatsApp
  window.open(whatsappUrl, '_blank');
};
```

## 🔍 Testing

### Test Your WhatsApp Button:
1. **Start your server**: `npm run dev`
2. **Navigate to any page** on your site
3. **Look for the green WhatsApp button** (bottom-right)
4. **Click the button** - should open WhatsApp
5. **Check the pre-filled message** - should show your custom message
6. **Test on mobile** - should open WhatsApp app

### Test Different Scenarios:
- ✅ **Desktop**: Opens WhatsApp Web or desktop app
- ✅ **Mobile**: Opens WhatsApp mobile app
- ✅ **No WhatsApp**: Opens WhatsApp download page
- ✅ **Different browsers**: Works on Chrome, Firefox, Safari, Edge

## 🚀 Advanced Features

### 1. Business Hours Integration
You can add business hours logic to show different messages:

```typescript
const isBusinessHours = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  // Monday-Friday 9AM-6PM, Saturday 10AM-4PM
  if (day >= 1 && day <= 5 && hour >= 9 && hour < 18) return true;
  if (day === 6 && hour >= 10 && hour < 16) return true;
  
  return false;
};

const message = isBusinessHours() 
  ? "Hi! I'm interested in your products."
  : "Hi! I'll get back to you during business hours.";
```

### 2. Product-Specific Messages
You can create dynamic messages based on the current page:

```typescript
const getProductMessage = (productName: string) => {
  return `Hi! I'm interested in the ${productName}. Can you provide pricing and availability?`;
};
```

### 3. Multiple Contact Options
You can add other contact buttons alongside WhatsApp:

```tsx
<div className="fixed bottom-6 right-6 z-50 space-y-2">
  <FloatingWhatsAppButton phoneNumber="+1234567890" />
  <PhoneButton phoneNumber="+1234567890" />
  <EmailButton email="info@dncl-techzone.com" />
</div>
```

## 🎯 Best Practices

### 1. Phone Number Format
- Use international format: `+1234567890`
- Include country code
- Remove spaces, dashes, parentheses

### 2. Message Content
- Keep it friendly and professional
- Include your business name
- Mention what you can help with
- Keep it under 100 characters

### 3. Response Time
- Set expectations in your message
- Mention business hours
- Provide alternative contact methods

### 4. Mobile Optimization
- Test on various mobile devices
- Ensure button is easily tappable
- Check that WhatsApp app opens correctly

## 🔧 Troubleshooting

### Common Issues:

#### Button Not Appearing
- Check if the component is imported correctly
- Verify the phone number format
- Check browser console for errors

#### WhatsApp Not Opening
- Ensure phone number is in international format
- Test with a valid WhatsApp number
- Check if WhatsApp is installed on device

#### Message Not Pre-filled
- Verify message encoding
- Check for special characters
- Test with a simple message first

### Debug Steps:
1. **Check browser console** for JavaScript errors
2. **Verify phone number** format in config
3. **Test WhatsApp URL** directly in browser
4. **Check component imports** in layout file

## 📈 Performance Impact

### Minimal Impact:
- ✅ **Small bundle size**: ~2KB additional
- ✅ **No external dependencies**: Pure React component
- ✅ **Lazy loading**: Only loads when needed
- ✅ **No API calls**: Direct WhatsApp URL generation

### Optimization:
- Component is lightweight
- No network requests on click
- Instant WhatsApp app opening
- No impact on page load speed

## 🎉 Success!

Your WhatsApp integration is now complete! Customers can easily contact you through WhatsApp from any page on your website. Remember to:

1. **Update your phone number** in the config file
2. **Test the button** on different devices
3. **Monitor customer engagement** through WhatsApp
4. **Respond promptly** to customer inquiries

The floating WhatsApp button will help increase customer engagement and make it easier for potential buyers to contact you about your wholesale products! 🚀
