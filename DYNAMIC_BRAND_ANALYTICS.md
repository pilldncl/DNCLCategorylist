# 🏷️ Dynamic Brand Analytics System

## Overview

The Dynamic Brand Analytics system provides real-time brand performance insights by automatically syncing with your Google Sheets catalog data. This system ensures that when clients add new products to your Google Sheets, the ranking system immediately recognizes and includes them in analytics.

## 🚀 Key Features

### **1. Live Google Sheets Integration**
- **Automatic Sync**: Fetches data directly from your Google Sheets CSV export
- **Real-time Updates**: New products appear in analytics immediately
- **Brand Discovery**: Automatically detects new brands from catalog data
- **Product Tracking**: Monitors all products across all brands

### **2. Brand-Specific Analytics**
- **Performance Metrics**: Views, clicks, conversion rates per brand
- **Product Rankings**: Top performing products within each brand
- **Interaction Tracking**: All user interactions tied to specific brands
- **Comparative Analysis**: Compare performance across brands

### **3. Dynamic Data Management**
- **Auto-refresh**: Updates every 5 minutes automatically
- **Change Detection**: Identifies new, updated, and removed products
- **Real-time Monitoring**: Live tracking of catalog changes
- **Error Handling**: Graceful fallbacks for data issues

## 📊 API Endpoints

### **Brand Analytics Overview**
```http
GET /api/ranking/brands

Response:
{
  "brands": [
    {
      "brand": "GOOGLE",
      "metrics": {
        "totalInteractions": 150,
        "productCount": 25,
        "pageViews": 45,
        "productViews": 30,
        "resultClicks": 15,
        "conversionRate": 0.5,
        "averagePrice": 299.99,
        "topProducts": [...]
      },
      "productCount": 25
    }
  ],
  "totalBrands": 8,
  "totalProducts": 150,
  "lastUpdated": "2025-01-20T10:30:00.000Z"
}
```

### **Specific Brand Details**
```http
GET /api/ranking/brands?brand=GOOGLE

Response:
{
  "brand": "GOOGLE",
  "metrics": {
    "totalInteractions": 150,
    "productCount": 25,
    "pageViews": 45,
    "categoryViews": 20,
    "productViews": 30,
    "resultClicks": 15,
    "searches": 25,
    "conversionRate": 0.5,
    "averagePrice": 299.99,
    "topProducts": [
      {
        "productId": "google-pixel-8-128",
        "views": 15,
        "clicks": 8,
        "score": 55
      }
    ]
  },
  "products": [
    {
      "id": "google-pixel-8-128",
      "brand": "GOOGLE",
      "name": "PIXEL-8-128",
      "price": 299.99,
      "grade": "A",
      "minQty": 1
    }
  ],
  "totalProducts": 25
}
```

## 🎯 Admin Interface

### **Brand Analytics Dashboard** (`/admin/ranking/brands`)

#### **Overview Section**
- **Total Brands**: Count of all brands in catalog
- **Total Products**: Count of all products across brands
- **Active Brands**: Brands with user interactions
- **Total Interactions**: Sum of all user interactions

#### **Brand List**
- **Interactive Selection**: Click any brand for detailed view
- **Product Count**: Shows products per brand
- **Interaction Count**: Real-time interaction metrics
- **Sorting**: Automatically sorted by popularity

#### **Brand Details**
- **Performance Metrics**: Views, clicks, conversion rates
- **Top Products**: Best performing products within brand
- **Product List**: Complete catalog for selected brand
- **Real-time Updates**: Live data from Google Sheets

## 🔄 Dynamic Integration

### **Automatic Product Detection**
```typescript
// When new products are added to Google Sheets:
// 1. System automatically detects new products
// 2. New products appear in brand analytics
// 3. Ranking system includes new products
// 4. No manual configuration required
```

### **Real-time Sync Process**
1. **Fetch Data**: Pulls latest CSV from Google Sheets
2. **Parse Products**: Extracts brand, product, and pricing data
3. **Update Analytics**: Recalculates brand metrics
4. **Refresh UI**: Updates admin dashboard automatically

### **Change Detection**
- **New Products**: Automatically added to analytics
- **Updated Products**: Price/description changes tracked
- **Removed Products**: Cleaned from analytics
- **Brand Changes**: New brands automatically discovered

## 🛠️ Implementation

### **Using the Dynamic Catalog Hook**
```typescript
import { useDynamicCatalog } from '@/hooks/useDynamicCatalog';

function BrandAnalytics() {
  const { 
    items, 
    brands, 
    loading, 
    refresh, 
    getBrandProducts,
    lastUpdated 
  } = useDynamicCatalog();

  // Auto-refreshes every 5 minutes
  // Provides real-time brand data
  // Handles loading and error states
}
```

### **Brand-Specific Product Filtering**
```typescript
// Get all products for a specific brand
const googleProducts = getBrandProducts('GOOGLE');

// Get products by category
const smartphoneProducts = getCategoryProducts('Smartphones');
```

### **Real-time Monitoring**
```typescript
import { useCatalogMonitoring } from '@/hooks/useDynamicCatalog';

function CatalogMonitor() {
  const { newProducts, updatedProducts, changes } = useCatalogMonitoring(
    previousItems, 
    currentItems
  );

  // Monitor catalog changes in real-time
  console.log(`New: ${changes.added}, Updated: ${changes.updated}, Removed: ${changes.removed}`);
}
```

## 📈 Analytics Features

### **Brand Performance Metrics**
- **Total Interactions**: All user interactions for brand
- **Product Views**: How many times products were viewed
- **Result Clicks**: User clicks on search results
- **Conversion Rate**: Clicks per product view
- **Average Price**: Mean price across brand products
- **Product Count**: Number of products in brand

### **Top Products Analysis**
- **Performance Ranking**: Products sorted by interaction score
- **View Count**: Number of product views
- **Click Count**: Number of result clicks
- **Score Calculation**: Weighted performance metric

### **Comparative Analytics**
- **Brand vs Brand**: Compare performance across brands
- **Product Performance**: Top products within each brand
- **Trend Analysis**: Performance over time
- **Market Share**: Brand popularity relative to others

## 🔧 Configuration

### **Google Sheets Setup**
```env
# Environment variable for Google Sheets CSV URL
SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv
```

### **Auto-refresh Settings**
```typescript
// Default: 5 minutes
const REFRESH_INTERVAL = 5 * 60 * 1000;

// Can be customized per component
useEffect(() => {
  const interval = setInterval(fetchData, REFRESH_INTERVAL);
  return () => clearInterval(interval);
}, []);
```

## 🎯 Benefits

### **For Business Users**
- **Live Data**: Always see current catalog information
- **No Manual Updates**: Automatic sync with Google Sheets
- **Brand Insights**: Understand which brands perform best
- **Product Performance**: Identify top products within brands

### **For Developers**
- **Real-time Integration**: Seamless Google Sheets connection
- **Scalable Architecture**: Handles growing catalog sizes
- **Error Resilience**: Graceful handling of data issues
- **Performance Optimized**: Efficient data fetching and caching

## 🚀 Getting Started

### **1. Access Brand Analytics**
Navigate to `/admin/ranking/brands` in your admin panel

### **2. View Brand Overview**
See all brands with their performance metrics

### **3. Select Specific Brand**
Click on any brand to view detailed analytics

### **4. Monitor Changes**
Watch for new products appearing automatically

### **5. Analyze Performance**
Use metrics to understand brand and product performance

## 🔮 Future Enhancements

### **Advanced Features**
- **Brand Comparison Charts**: Visual brand performance comparison
- **Trend Analysis**: Performance over time graphs
- **Predictive Analytics**: Forecast brand performance
- **Export Capabilities**: Download brand analytics reports

### **Integration Opportunities**
- **Email Alerts**: Notify when new products are added
- **Slack Integration**: Real-time brand performance updates
- **Custom Dashboards**: Personalized brand analytics views
- **API Access**: External system integration

---

This dynamic brand analytics system ensures your ranking data is always current and provides deep insights into brand performance, automatically adapting to changes in your Google Sheets catalog.
