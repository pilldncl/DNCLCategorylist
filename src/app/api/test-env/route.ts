import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    SHEET_CSV_URL: process.env.SHEET_CSV_URL,
    CACHE_SECONDS: process.env.CACHE_SECONDS,
    NODE_ENV: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('SHEET') || key.includes('CSV'))
  });
}
