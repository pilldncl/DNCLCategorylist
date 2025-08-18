import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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

const IMAGES_DIR = path.join(process.cwd(), 'public', 'product-images');
const IMAGES_CONFIG_FILE = path.join(process.cwd(), 'data', 'dynamic-images.json');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    await fs.mkdir(path.dirname(IMAGES_CONFIG_FILE), { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Load image configuration
async function loadImageConfig() {
  try {
    const configData = await fs.readFile(IMAGES_CONFIG_FILE, 'utf-8');
    return JSON.parse(configData);
  } catch {
    // Return default config if file doesn't exist
    return {
      devices: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

// Save image configuration
async function saveImageConfig(config: ImageConfig) {
  try {
    await fs.writeFile(IMAGES_CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error saving image config:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await ensureDirectories();
    const config = await loadImageConfig();
    
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
    await ensureDirectories();
    const config = await loadImageConfig();
    const body = await request.json();
    
    const { device, model, brand, imageUrls, action } = body;
    
    if (action === 'add' || action === 'update') {
      // Find existing device or create new one
      const existingIndex = config.devices.findIndex(
        (d: DeviceImage) => d.device === device && d.model === model && d.brand === brand
      );
      
      const deviceData = {
        device,
        model,
        brand,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [imageUrls],
        lastUpdated: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        config.devices[existingIndex] = deviceData;
      } else {
        config.devices.push(deviceData);
      }
      
      config.lastUpdated = new Date().toISOString();
      await saveImageConfig(config);
      
      return NextResponse.json({ 
        success: true, 
        message: `Device ${device} ${model} ${action === 'add' ? 'added' : 'updated'} successfully` 
      });
    }
    
    if (action === 'delete') {
      const filteredDevices = config.devices.filter(
        (d: DeviceImage) => !(d.device === device && d.model === model && d.brand === brand)
      );
      
      config.devices = filteredDevices;
      config.lastUpdated = new Date().toISOString();
      await saveImageConfig(config);
      
      return NextResponse.json({ 
        success: true, 
        message: `Device ${device} ${model} deleted successfully` 
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error updating images:', error);
    return NextResponse.json(
      { error: 'Failed to update images' },
      { status: 500 }
    );
  }
}
