/**
 * Date Formatting Utilities
 * Standardized timestamp formatting across the application
 */

/**
 * Format timestamp with full date, time, and timezone
 * Format: MM/DD/YYYY, HH:MM:SS AM/PM (Timezone)
 */
export const formatTimestamp = (timestamp: string | Date): string => {
  let date: Date;
  
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    // If timestamp is an ISO string without 'Z' or timezone offset, Supabase typically stores UTC
    // so we parse it as UTC explicitly
    const isoString = timestamp.includes('Z') || timestamp.includes('+') || timestamp.includes('-', 10)
      ? timestamp 
      : `${timestamp}Z`; // Add Z if missing to indicate UTC
    date = new Date(isoString);
  } else {
    date = new Date(timestamp);
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short' // This adds the timezone abbreviation (e.g., EST, PST, GMT+7)
  };
  return date.toLocaleString('en-US', options);
};

/**
 * Format timestamp to date only
 * Format: MM/DD/YYYY
 */
export const formatDate = (timestamp: string | Date): string => {
  let date: Date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    const isoString = timestamp.includes('Z') || timestamp.includes('+') || timestamp.includes('-', 10)
      ? timestamp 
      : `${timestamp}Z`;
    date = new Date(isoString);
  } else {
    date = new Date(timestamp);
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format timestamp to time only with timezone
 * Format: HH:MM:SS AM/PM (Timezone)
 */
export const formatTime = (timestamp: string | Date): string => {
  let date: Date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    const isoString = timestamp.includes('Z') || timestamp.includes('+') || timestamp.includes('-', 10)
      ? timestamp 
      : `${timestamp}Z`;
    date = new Date(isoString);
  } else {
    date = new Date(timestamp);
  }
  
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  };
  return date.toLocaleTimeString('en-US', options);
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export const formatRelativeTime = (timestamp: string | Date): string => {
  let date: Date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    const isoString = timestamp.includes('Z') || timestamp.includes('+') || timestamp.includes('-', 10)
      ? timestamp 
      : `${timestamp}Z`;
    date = new Date(isoString);
  } else {
    date = new Date(timestamp);
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  // Fall back to full timestamp format for older dates
  return formatTimestamp(date);
};

