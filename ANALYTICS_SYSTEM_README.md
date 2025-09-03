# Historical Analytics System

A comprehensive analytics system that tracks user interactions and provides historical data insights for the DNCL Wholesale Catalog.

## 🎯 Features

### **Core Analytics**
- **Daily Metrics Tracking** - Sessions, interactions, conversions, bounce rates
- **Time Series Data** - Hourly, daily, weekly, monthly aggregations
- **User Behavior Analysis** - Page views, searches, product interactions
- **Performance Metrics** - Session duration, conversion rates, engagement

### **Data Visualization**
- **Interactive Dashboard** - Real-time charts and metrics
- **Summary Cards** - Key performance indicators at a glance
- **Daily Breakdown Table** - Detailed metrics by date
- **Export Functionality** - CSV and JSON data export

### **Advanced Filtering**
- **Date Range Selection** - Custom start/end dates
- **Time Grouping** - Hour, day, week, month views
- **Brand/Category Filters** - Segment data by product attributes
- **Metric Selection** - Choose specific metrics to display

## 🏗️ Architecture

### **Frontend Components**
```
src/components/AnalyticsDashboard.tsx    # Main dashboard component
src/hooks/useAnalytics.ts                # Analytics data management hook
src/app/analytics/page.tsx               # Analytics page route
```

### **Backend API**
```
src/app/api/analytics/historical/route.ts # Historical data endpoint
src/types/analytics.ts                    # TypeScript interfaces
```

### **Data Flow**
```
User Interactions → Database → Analytics API → Dashboard → Charts
     ↓                    ↓           ↓           ↓
  Tracking          Aggregation    Processing   Display
```

## 🚀 Getting Started

### **1. Access the Dashboard**
Navigate to `/analytics` in your application to view the analytics dashboard.

### **2. View Historical Data**
- **Default View**: Last 30 days of data
- **Date Range**: Customizable start/end dates
- **Grouping**: Hour, day, week, or month aggregations

### **3. Filter Data**
- Select specific date ranges
- Choose metrics to display
- Filter by brands or categories
- Group data by time periods

## 📊 Metrics Explained

### **Session Metrics**
- **Total Sessions**: Number of unique user sessions
- **Unique Users**: Number of distinct users
- **Average Session Duration**: Mean time per session
- **Bounce Rate**: Percentage of single-page sessions

### **Interaction Metrics**
- **Page Views**: Total page loads
- **Searches**: Search queries performed
- **Product Views**: Product detail page visits
- **Result Clicks**: Product selection clicks
- **Category Views**: Category page visits

### **Performance Metrics**
- **Conversion Rate**: Clicks per total interactions
- **Engagement Rate**: Interactions per session
- **Trend Analysis**: Performance over time

## 🔧 API Endpoints

### **GET /api/analytics/historical**
Fetches historical analytics data with filtering options.

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `groupBy`: Time grouping (hour|day|week|month)
- `metrics`: Comma-separated metric list
- `brands`: Comma-separated brand list
- `categories`: Comma-separated category list

**Response:**
```json
{
  "success": true,
  "data": {
    "dailyMetrics": [...],
    "timeSeriesData": {...},
    "summary": {...},
    "filters": {...}
  }
}
```

## 📈 Data Visualization

### **Charts Available**
1. **Sessions Over Time** - User session trends
2. **Interactions Over Time** - User engagement patterns
3. **Conversion Rates** - Performance metrics
4. **Bounce Rates** - User retention analysis

### **Chart Types**
- **Bar Charts**: Simple, effective data representation
- **Time Series**: Trend analysis over time
- **Summary Cards**: Key metrics at a glance

## 📤 Export Functionality

### **Supported Formats**
- **CSV**: Comma-separated values for spreadsheet analysis
- **JSON**: Structured data for API integration

### **Exportable Data**
- Daily metrics breakdown
- Time series data
- Summary statistics
- Filtered results

## 🧪 Testing

### **Run Analytics Tests**
```bash
node test-analytics-system.js
```

### **Test Coverage**
- ✅ Historical Analytics API
- ✅ Filtered Analytics
- ✅ Analytics Page Access
- ✅ User Interactions Data

## 🔍 Data Sources

### **User Interactions Table**
The analytics system aggregates data from the existing `user_interactions` table:

```sql
-- Example interaction types tracked
- page_view: User visits a page
- search: User performs a search
- product_view: User views product details
- result_click: User clicks on a product
- category_view: User browses a category
```

### **Real-time Tracking**
All user interactions are automatically tracked through the existing ranking system and stored with timestamps for historical analysis.

## 📱 Responsive Design

### **Mobile-First Approach**
- Optimized for mobile devices
- Touch-friendly controls
- Responsive charts and tables
- Adaptive layout for different screen sizes

### **Desktop Enhancements**
- Full dashboard view
- Advanced filtering options
- Detailed data tables
- Export functionality

## 🚀 Performance Features

### **Optimizations**
- **Caching**: 5-minute cache with stale-while-revalidate
- **Lazy Loading**: Components load on demand
- **Efficient Queries**: Optimized database queries
- **Pagination**: Large datasets handled efficiently

### **Scalability**
- **Database Indexing**: Optimized for time-based queries
- **API Rate Limiting**: Built-in request throttling
- **Memory Management**: Efficient data processing
- **Error Handling**: Graceful degradation

## 🔒 Security & Privacy

### **Data Protection**
- **User Anonymization**: No personal data stored
- **Session Tracking**: Anonymous session IDs
- **Access Control**: Admin-only analytics access
- **Data Retention**: Configurable data retention policies

## 🛠️ Customization

### **Adding New Metrics**
1. Update `DailyMetrics` interface in `types/analytics.ts`
2. Modify calculation logic in the API
3. Add visualization in the dashboard
4. Update export functionality

### **Custom Charts**
1. Extend `TimeSeriesData` interface
2. Add chart rendering logic
3. Integrate with charting libraries
4. Update dashboard component

## 📚 Integration Examples

### **With Existing Systems**
```typescript
// Use analytics hook in components
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { dailyMetrics, loading, fetchAnalytics } = useAnalytics();
  
  // Use analytics data
  return <div>{/* Your component */}</div>;
}
```

### **API Integration**
```typescript
// Fetch analytics data directly
const response = await fetch('/api/analytics/historical?startDate=2024-01-01');
const data = await response.json();
```

## 🎯 Use Cases

### **Business Intelligence**
- **Performance Monitoring**: Track daily/weekly trends
- **User Behavior Analysis**: Understand customer journey
- **Conversion Optimization**: Identify improvement opportunities
- **Resource Planning**: Plan based on usage patterns

### **Marketing Analytics**
- **Campaign Performance**: Measure marketing effectiveness
- **User Segmentation**: Identify target audiences
- **A/B Testing**: Compare different approaches
- **ROI Analysis**: Measure return on investment

### **Product Development**
- **Feature Usage**: Track feature adoption
- **User Feedback**: Monitor user satisfaction
- **Performance Issues**: Identify technical problems
- **User Experience**: Optimize user flows

## 🔮 Future Enhancements

### **Planned Features**
- **Real-time Dashboard**: Live data updates
- **Advanced Charts**: Interactive visualizations
- **Machine Learning**: Predictive analytics
- **Custom Reports**: User-defined dashboards
- **Alert System**: Performance notifications
- **Data Export**: More export formats

### **Integration Opportunities**
- **Google Analytics**: Import external data
- **CRM Systems**: Customer relationship data
- **Email Marketing**: Campaign performance
- **Social Media**: Social engagement metrics

## 📞 Support

### **Getting Help**
- Check the existing documentation
- Review the test scripts
- Examine the component code
- Check browser console for errors

### **Common Issues**
- **No Data**: Ensure user interactions are being tracked
- **Slow Loading**: Check database performance
- **Chart Errors**: Verify data format
- **Export Issues**: Check browser download settings

## 🎉 Conclusion

The Historical Analytics System provides comprehensive insights into user behavior and application performance. It's built on your existing infrastructure and follows your established patterns for maintainability and scalability.

**Key Benefits:**
- ✅ **Real-time Insights**: Live user behavior tracking
- ✅ **Historical Analysis**: Long-term trend identification
- ✅ **Performance Monitoring**: Application health tracking
- ✅ **Data Export**: External analysis capabilities
- ✅ **Responsive Design**: Works on all devices
- ✅ **Scalable Architecture**: Grows with your needs

Start exploring your data at `/analytics` and discover valuable insights about your wholesale catalog performance!
