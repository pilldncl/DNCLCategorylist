// Historical Analytics Types
export interface DailyMetrics {
  date: string; // YYYY-MM-DD format
  totalSessions: number;
  uniqueUsers: number;
  totalInteractions: number;
  pageViews: number;
  searches: number;
  productViews: number;
  resultClicks: number;
  categoryViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  // New contact tracking metrics
  contactFormSubmissions: number;
  phoneClicks: number;
  whatsappClicks: number;
  totalLeads: number; // Combined contact activities
  leadConversionRate: number; // Sessions to leads ratio
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  interactions: number;
  pages: string[];
  lastActivity: Date;
  deviceInfo?: {
    userAgent: string;
    screenResolution?: string;
    timezone?: string;
  };
  // New contact tracking
  contactActivities: {
    formSubmitted: boolean;
    phoneClicked: boolean;
    whatsappClicked: boolean;
    productsOfInterest: string[];
  };
}

export interface TimeSeriesData {
  labels: string[]; // Date labels
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
  }[];
}

export interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  groupBy: 'hour' | 'day' | 'week' | 'month';
  metrics: string[];
  brands?: string[];
  categories?: string[];
}

export interface BrandPerformance {
  brand: string;
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  averageRank: number;
  trend: 'up' | 'down' | 'stable';
  dailyMetrics: DailyMetrics[];
  // New contact metrics
  totalLeads: number;
  leadConversionRate: number;
  contactFormSubmissions: number;
  phoneClicks: number;
  whatsappClicks: number;
}

export interface CategoryPerformance {
  category: string;
  totalViews: number;
  totalClicks: number;
  conversionRate: number;
  popularProducts: string[];
  dailyMetrics: DailyMetrics[];
  // New contact metrics
  totalLeads: number;
  leadConversionRate: number;
  contactFormSubmissions: number;
  phoneClicks: number;
  whatsappClicks: number;
}

export interface SearchAnalytics {
  term: string;
  frequency: number;
  conversionRate: number;
  relatedBrands: string[];
  relatedCategories: string[];
  dailyTrend: number[];
}

export interface UserJourney {
  sessionId: string;
  steps: {
    timestamp: Date;
    action: string;
    details: any;
  }[];
  conversion: boolean;
  duration: number;
  exitPage?: string;
  // New contact tracking
  contactAttempts: {
    formSubmission: boolean;
    phoneClick: boolean;
    whatsappClick: boolean;
    timestamp: Date;
    productContext?: string;
  }[];
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  dailyMetrics: DailyMetrics[];
}

export interface AnalyticsExport {
  type: 'csv' | 'json' | 'excel';
  data: any[];
  filters: AnalyticsFilters;
  generatedAt: Date;
  format: 'daily' | 'weekly' | 'monthly' | 'custom';
}

// New: Contact Tracking Summary
export interface ContactTrackingSummary {
  totalLeads: number;
  contactFormSubmissions: number;
  phoneClicks: number;
  whatsappClicks: number;
  leadConversionRate: number; // Sessions to leads
  topContactedProducts: {
    productId: string;
    productName: string;
    contactCount: number;
    contactRate: number; // Views to contacts ratio
  }[];
  contactMethodPreference: {
    form: number;
    phone: number;
    whatsapp: number;
  };
  dailyContactTrend: {
    date: string;
    leads: number;
    formSubmissions: number;
    phoneClicks: number;
    whatsappClicks: number;
  }[];
}
