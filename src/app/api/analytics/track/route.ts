import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/analytics/track - Starting request processing...');
    
    const body = await request.json();
    const { type, productId, sessionId, timestamp, metadata, brand, searchTerm } = body;

    console.log('📊 Request body received:', {
      type,
      productId,
      sessionId,
      timestamp,
      brand,
      searchTerm,
      hasMetadata: !!metadata
    });

    // Validate required fields
    if (!type || !sessionId) {
      console.error('❌ Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: type and sessionId' },
        { status: 400 }
      );
    }

    console.log('✅ Validation passed');

    // Map to correct database schema
            const interactionData: any = {
          type: type, // Use 'type' column as per actual database schema
          session_id: sessionId,
          timestamp: timestamp || new Date().toISOString(),
          ...(productId && { product_id: productId }), // Map 'productId' to 'product_id'
          ...(brand && { brand }),
          ...(searchTerm && { search_term: searchTerm }), // Map 'searchTerm' to 'search_term'
          ...(metadata && { metadata })
        };

    // Add contact tracking specific fields if they exist in the table
    // Note: These fields should have been added by your SQL migration
    if (type === 'contact_form_submitted') {
      interactionData.contact_form_submitted = true;
    } else if (type === 'phone_clicked') {
      interactionData.phone_clicked = true;
    } else if (type === 'whatsapp_clicked') {
      interactionData.whatsapp_clicked = true;
    }

    console.log('📝 Prepared interaction data for database:', interactionData);

    // Test database connection first
    console.log('🔌 Testing database connection...');
    try {
      const { data: testData, error: testError } = await supabaseAdmin
        .from('user_interactions')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('❌ Database connection test failed:', testError);
        throw new Error(`Database connection failed: ${testError.message}`);
      }
      
      console.log('✅ Database connection test passed');
    } catch (connectionError) {
      console.error('❌ Database connection error:', connectionError);
      throw new Error(`Database connection failed: ${connectionError instanceof Error ? connectionError.message : 'Unknown error'}`);
    }

    // Insert into user_interactions table
    console.log('📥 Inserting data into database...');
    const { data, error } = await supabaseAdmin
      .from('user_interactions')
      .insert([interactionData])
      .select();

    if (error) {
      console.error('❌ Database insert failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to track interaction', 
          details: error.message,
          code: error.code,
          hint: error.hint || 'Check database schema and permissions'
        },
        { status: 500 }
      );
    }

    console.log('✅ Interaction tracked successfully:', data);

    return NextResponse.json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Fatal error in analytics tracking:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to track interaction', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}
