import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { pincode } = await req.json();

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return new Response(JSON.stringify({ error: "Valid 6-digit Indian pincode is required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call OpenStreetMap Nominatim API for geocoding
    // Format: https://nominatim.openstreetmap.org/search?postalcode={pincode}&country=India&format=json
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GigTic-StudentApp/1.0',
      },
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch from Geocoding API');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const { lat, lon } = data[0];
      return new Response(JSON.stringify({ 
        lat: parseFloat(lat), 
        lng: parseFloat(lon) 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ error: "Pincode not found" }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
