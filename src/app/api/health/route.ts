import { NextResponse } from 'next/server';

/**
 * Simple health check endpoint for Coolify's health check system
 * GET /api/health
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "JagaSuara",
      version: process.env.npm_package_version || "1.0.0"
    },
    { status: 200 }
  );
}
