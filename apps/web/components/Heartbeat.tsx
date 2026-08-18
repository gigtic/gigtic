"use client";

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function Heartbeat() {
  useEffect(() => {
    const supabase = createClient();
    
    // Function to ping the server
    const ping = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // We only care about calling it, response doesn't matter
        await supabase.rpc('update_last_active');
      }
    };

    // Ping immediately on load
    ping();

    // Then ping every 3 minutes (180000 ms)
    const interval = setInterval(ping, 180000);

    return () => clearInterval(interval);
  }, []);

  return null; // This component renders nothing
}
