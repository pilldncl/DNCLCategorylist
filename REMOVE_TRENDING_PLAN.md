# Trending Functionality Removal Plan

## 🎯 Objective
Safely remove all trending functionality from the codebase while preserving all other features and functionality.

## 📋 Components to Remove

### 1. API Endpoints
- [ ] `/src/app/api/ranking/trending/route.ts` (legacy in-memory system)
- [ ] `/src/app/api/ranking/trending-db/route.ts` (database-based system)
- [ ] `/src/app/api/ranking/trending-db/config/route.ts` (configuration)

### 2. Frontend Components
- [ ] `/src/hooks/useTrendingProducts.ts` (trending hook)
- [ ] `/src/app/admin/trending/page.tsx` (admin trending page)
- [ ] `/src/app/admin/trending-management/page.tsx` (trending management)
- [ ] `/src/app/admin/fire-badges/page.tsx` (fire badges management)

### 3. Database Tables (SQL Scripts)
- [ ] `trending_products`
- [ ] `trending_config`
- [ ] `trending_rankings` (materialized view)
- [ ] `fire_badges`
- [ ] `manual_fire_badges`

### 4. Code Integration Points
- [ ] Remove trending imports from `/src/app/page.tsx`
- [ ] Remove trending section from main page
- [ ] Remove fire badge logic from product displays
- [ ] Remove trending from admin dashboard
- [ ] Remove trending from ranking system
- [ ] Remove trending from interaction tracking

### 5. Configuration Files
- [ ] Remove trending config from admin settings
- [ ] Remove trending from package.json scripts
- [ ] Remove trending test files

## 🔧 Implementation Steps

### Phase 1: Remove Frontend Dependencies
1. Remove trending imports and usage from main page
2. Remove trending section from UI
3. Remove fire badge displays
4. Update admin dashboard to remove trending stats

### Phase 2: Remove API Endpoints
1. Delete trending API route files
2. Remove trending calls from interaction tracking
3. Update any remaining API references

### Phase 3: Remove Database Tables
1. Create SQL script to drop trending tables
2. Remove trending-related database scripts
3. Clean up any database references

### Phase 4: Clean Up Configuration
1. Remove trending from admin settings
2. Remove trending test files
3. Update documentation

## ⚠️ Safety Measures
- Keep backup of trending functionality before removal
- Test each phase thoroughly
- Ensure product ranking still works without trending
- Verify admin dashboard functionality
- Check that product interaction tracking still works

## 🎯 Expected Outcome
- Clean codebase without trending functionality
- All other features working normally
- No broken imports or references
- Simplified admin interface
- Maintained product ranking (without trending influence)
