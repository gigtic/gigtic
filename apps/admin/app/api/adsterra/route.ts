import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.ADSTERRA_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Adsterra API Key" }, { status: 401 });
  }

  try {
    // Calculate dates for the last 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    
    // Format YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const startDateStr = formatDate(start);
    const endDateStr = formatDate(end);

    const apiUrl = `https://api3.adsterratools.com/publisher/stats.json?start_date=${startDateStr}&finish_date=${endDateStr}`;
    
    const res = await fetch(apiUrl, {
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // cache for 1 hour to prevent rate limits
    });

    if (!res.ok) {
      console.error("Adsterra API Error:", await res.text());
      throw new Error(`Adsterra API responded with status ${res.status}`);
    }

    const json = await res.json();
    
    // Process the data
    const items = json.items || [];
    
    let totalRevenue = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    
    const recentDays = items.map((item: any) => {
      totalRevenue += item.revenue || 0;
      totalImpressions += item.impression || 0;
      totalClicks += item.clicks || 0;
      
      return {
        date: item.date,
        revenue: item.revenue || 0,
        impressions: item.impression || 0,
      };
    });

    const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const averageCpm = totalImpressions > 0 ? (totalRevenue / (totalImpressions / 1000)) : 0;

    return NextResponse.json({
      status: 'success',
      data: {
        total_revenue: totalRevenue.toFixed(3),
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: averageCtr.toFixed(2),
        cpm: averageCpm.toFixed(3),
        recent_days: recentDays
      }
    });

  } catch (error: any) {
    console.error("Failed to fetch Adsterra stats:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}
