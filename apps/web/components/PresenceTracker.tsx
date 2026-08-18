"use client";

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function PresenceTracker() {
  useEffect(() => {
    const supabase = createClient();
    let channel: any;

    const initPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // We can track presence even for anonymous users, but let's track logged-in users
      if (user) {
        channel = supabase.channel('global_presence', {
          config: {
            presence: {
              key: user.id,
            },
          },
        });

        channel.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        });
      }
    };

    initPresence();

    return () => {
      if (channel) {
        channel.untrack();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return null;
}
