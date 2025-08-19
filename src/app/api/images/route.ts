import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface DeviceImage {
  device: string;
  model: string;
  brand: string;
  imageUrls: string[];
  lastUpdated: string;
}

interface ImageConfig {
  devices: DeviceImage[];
  lastUpdated: string;
}

// Load image configuration from Supabase database
async function loadImageConfigFromDatabase(): Promise<ImageConfig> {
  try {
    const { data, error } = await supabase
      .from('dynamic_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading images from database:', error);
      return {
        devices: [],
        lastUpdated: new Date().toISOString()
      };
    }

    // Convert database format to config format
    const devices: DeviceImage[] = data.map(item => ({
      device: item.device,
      model: item.model,
      brand: item.brand,
      imageUrls: item.image_urls,
      lastUpdated: item.updated_at
    }));

    return {
      devices,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error loading images from database:', error);
    return {
      devices: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

// Save image configuration to Supabase database
async function saveImageConfigToDatabase(device: string, model: string, brand: string, imageUrls: string[]) {
  try {
    // Check if record exists
    const { data: existing } = await supabase
      .from('dynamic_images')
      .select('id')
      .eq('device', device)
      .eq('model', model)
      .eq('brand', brand)
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('dynamic_images')
        .update({
          image_urls: imageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('device', device)
        .eq('model', model)
        .eq('brand', brand);

      if (error) {
        console.error('Error updating image in database:', error);
        throw error;
      }
    } else {
      // Insert new record
      const { error } = await supabase
        .from('dynamic_images')
        .insert({
          device,
          model,
          brand,
          image_urls: imageUrls,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error inserting image into database:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error saving image to database:', error);
    throw error;
  }
}

// Delete image configuration from Supabase database
async function deleteImageConfigFromDatabase(device: string, model: string, brand: string) {
  try {
    const { error } = await supabase
      .from('dynamic_images')
      .delete()
      .eq('device', device)
      .eq('model', model)
      .eq('brand', brand);

    if (error) {
      console.error('Error deleting image from database:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image from database:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const config = await loadImageConfigFromDatabase();
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading images:', error);
    return NextResponse.json(
      { error: 'Failed to load images' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { device, model, brand, imageUrls, action } = body;
    
    if (action === 'add' || action === 'update') {
      const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
      
      await saveImageConfigToDatabase(device, model, brand, urls);
      
      return NextResponse.json({ 
        success: true, 
        message: `Device ${device} ${model} ${action === 'add' ? 'added' : 'updated'} successfully in database` 
      });
    }
    
    if (action === 'delete') {
      await deleteImageConfigFromDatabase(device, model, brand);
      
      return NextResponse.json({ 
        success: true, 
        message: `Device ${device} ${model} deleted successfully from database` 
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error updating images:', error);
    return NextResponse.json(
      { error: 'Failed to update images in database' },
      { status: 500 }
    );
  }
}
