# DNCL Wholesale Catalog

A Next.js application that fetches Google Sheets data and displays it in a filterable table.

## Features

- 📊 Fetches data from Google Sheets via CSV export
- 🔍 Real-time filtering by brand, grade, minimum quantity, and search
- 🔗 Deep-link support for sharing filtered views
- 📱 Responsive design for mobile and desktop
- ⚡ Caching for improved performance
- 🎨 Modern UI with Tailwind CSS

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   # Google Sheets CSV URL (required)
   # Format: https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv
   SHEET_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv
   
   # Cache duration in seconds (optional, default: 300)
   CACHE_SECONDS=300
   ```

3. **Google Sheets Setup:**
   - Create a Google Sheet with columns: `brand`, `name`, `grade`, `minQty`, `price`, `description`, `category`
   - Make the sheet publicly accessible
   - Get the CSV export URL by replacing the sheet ID in the format above

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `SHEET_CSV_URL`: Your Google Sheets CSV export URL
- `CACHE_SECONDS`: Cache duration (optional, default: 300)

## CSV Format

Your Google Sheet should have these columns:
- `brand` (required): Product brand name
- `name` (required): Product name
- `grade` (optional): Product grade/quality
- `minQty` (optional): Minimum order quantity
- `price` (optional): Product price
- `description` (optional): Product description
- `category` (optional): Product category

## API Endpoints

- `GET /api/catalog` - Returns normalized JSON from Google Sheets CSV

## Technologies Used

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Hooks
- Next.js API Routes
