import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ADSTERRA_API_KEY;
  
  if (!apiKey) {
    // Return mock data for the dashboard if no API key is provided
    return NextResponse.json({
      status: 'mock',
      data: {
        total_revenue: 1245.50,
        impressions: 452000,
        clicks: 12400,
        ctr: 2.74,
        cpm: 2.75,
        recent_days: [
          { date: '2026-08-12', revenue: 145.20, impressions: 52000 },
          { date: '2026-08-13', revenue: 162.80, impressions: 58000 },
          { date: '2026-08-14', revenue: 158.40, impressions: 56000 },
          { date: '2026-08-15', revenue: 175.50, impressions: 62000 },
          { date: '2026-08-16', revenue: 190.10, impressions: 68000 },
          { date: '2026-08-17', revenue: 210.30, impressions: 75000 },
          { date: '2026-08-18', revenue: 203.20, impressions: 71000 },
        ]
      }
    });
  }

  // If you have the real API Key, you can implement the Adsterra API call here.
  // Example: 
  // const res = await fetch(`https://api3.adsterra.com/v3/publishers/.../stats.json`, { ... })
  
  return NextResponse.json({ error: "API integration not fully implemented" }, { status: 501 });
}
