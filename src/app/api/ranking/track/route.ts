import { NextRequest, NextResponse } from 'next/server';
import { UserInteraction } from '@/types/ranking';
import { supabaseAdmin } from '@/lib/supabase';

// Function to detect brand from search term
function detectBrandFromSearch(searchTerm: string, catalogItems: Array<{ brand?: string }>): string | null {
  const searchLower = searchTerm.toLowerCase();
  
  // Check if search term contains brand name
  for (const item of catalogItems) {
    if (item.brand && searchLower.includes(item.brand.toLowerCase())) {
      return item.brand;
    }
  }
  
  // Check for common brand variations (matching catalog format)
  const brandVariations: { [key: string]: string } = {
    'iphone': 'APPLE',
    'ipad': 'APPLE',
    'macbook': 'APPLE',
    'imac': 'APPLE',
    'pixel': 'GOOGLE',
    'samsung': 'SAMSUNG',
    'galaxy': 'SAMSUNG',
    'dell': 'DELL',
    'hp': 'HP',
    'lenovo': 'LENOVO',
    'thinkpad': 'LENOVO',
    'asus': 'ASUS',
    'acer': 'ACER',
    'msi': 'MSI',
    'razer': 'RAZER'
  };
  
  for (const [term, brand] of Object.entries(brandVariations)) {
    if (searchLower.includes(term)) {
      return brand;
    }
  }
  
  return null;
}

// In-memory storage for interactions (in production, use database)
let interactions: UserInteraction[] = [];

// Trending system sync removed

// Brand analytics now uses the main tracking system directly
// No separate sync needed - all interactions are automatically available

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, productId, brand, category, searchTerm, sessionId, userId } = body;
    
    console.log('📥 POST /api/ranking/track - Received interaction:', {
      type,
      productId,
      brand,
      category,
      searchTerm,
      sessionId,
      userId
    });

    // Validate required fields
    if (!type || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: type and sessionId' },
        { status: 400 }
      );
    }

    // Validate interaction type
    const validTypes = ['page_view', 'category_view', 'product_view', 'result_click', 'search'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid interaction type' },
        { status: 400 }
      );
    }

    // Create interaction record
    const interaction: UserInteraction = {
      type,
      productId,
      brand,
      category,
      searchTerm,
      sessionId,
      userId,
      timestamp: new Date()
    };

    // For search interactions, try to detect brand from search term if not provided
    if (type === 'search' && searchTerm && !brand) {
      try {
        // Fetch catalog to detect brand from search term
        const catalogResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/catalog`);
        if (catalogResponse.ok) {
          const catalogData = await catalogResponse.json();
          const detectedBrand = detectBrandFromSearch(searchTerm, catalogData.items);
          if (detectedBrand) {
            interaction.brand = detectedBrand;
            console.log(`🔍 Auto-detected brand "${detectedBrand}" from search term "${searchTerm}"`);
          }
        }
      } catch (error) {
        console.error('Error detecting brand from search term:', error);
      }
    }

    // Store interaction in memory (for backward compatibility)
    interactions.push(interaction);

    // Keep only last 1000 interactions to prevent memory issues
    if (interactions.length > 1000) {
      interactions = interactions.slice(-1000);
    }

    // Save interaction to database
    try {
      console.log('💾 Attempting to save interaction to database:', {
        type: interaction.type,
        product_id: interaction.productId,
        brand: interaction.brand,
        search_term: interaction.searchTerm,
        session_id: interaction.sessionId,
        user_id: interaction.userId,
        timestamp: interaction.timestamp.toISOString()
      });

      const { data: insertResult, error: dbError } = await supabaseAdmin
        .from('user_interactions')
        .insert({
          type: interaction.type,
          type: interaction.type, // Use 'type' column as per database schema
          product_id: interaction.productId,
          brand: interaction.brand,
          search_term: interaction.searchTerm,
          session_id: interaction.sessionId,
          user_id: interaction.userId,
          timestamp: interaction.timestamp.toISOString()
        })
        .select();

      if (dbError) {
        console.error('❌ Error saving interaction to database:', dbError);
      } else {
        console.log(`✅ Successfully saved interaction to database:`, insertResult);
      }
    } catch (error) {
      console.error('❌ Exception saving interaction to database:', error);
    }

    // Trending system sync removed
    
    // Brand analytics now uses database directly - no sync needed
    console.log(`📊 Interaction saved to database - brand analytics will read from database`);

    console.log('📤 POST /api/ranking/track - Returning success response');
    return NextResponse.json({ success: true, interaction });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}



export async function GET() {
  try {
    console.log('📥 GET /api/ranking/track - Fetching interaction stats from database');
    
    // Get interactions from database
    const { data: dbInteractions, error: dbError } = await supabaseAdmin
      .from('user_interactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (dbError) {
      console.error('❌ Error fetching interactions from database:', dbError);
      console.log('🔄 Falling back to memory data');
      // Fallback to memory data
      const stats = {
        totalInteractions: interactions.length,
        byType: interactions.reduce((acc, interaction) => {
          acc[interaction.type] = (acc[interaction.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentInteractions: interactions.slice(-10) // Last 10 interactions
      };
      console.log('📤 GET /api/ranking/track - Returning fallback stats:', stats);
      return NextResponse.json(stats);
    }

    // Convert database format to match memory format
    const convertedInteractions = dbInteractions?.map(dbInteraction => ({
              type: dbInteraction.type, // Use 'type' column as per database schema
      productId: dbInteraction.product_id,
      brand: dbInteraction.brand,
      category: dbInteraction.category,
      searchTerm: dbInteraction.search_term,
      sessionId: dbInteraction.session_id,
      userId: dbInteraction.user_id,
      timestamp: new Date(dbInteraction.timestamp)
    })) || [];

    // Return interaction statistics from database
    const stats = {
      totalInteractions: convertedInteractions.length,
      byType: convertedInteractions.reduce((acc, interaction) => {
        acc[interaction.type] = (acc[interaction.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentInteractions: convertedInteractions.slice(0, 10) // First 10 (already ordered by timestamp desc)
    };

    console.log('📤 GET /api/ranking/track - Returning database stats:', {
      totalInteractions: stats.totalInteractions,
      byType: stats.byType,
      recentCount: stats.recentInteractions.length
    });
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting interaction stats:', error);
    return NextResponse.json(
      { error: 'Failed to get interaction stats' },
      { status: 500 }
    );
  }
}
