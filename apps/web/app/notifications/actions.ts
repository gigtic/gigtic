"use server";

import { createClient } from "@supabase/supabase-js";

// We use the service role key to bypass RLS because the notifications table might not have a DELETE policy
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function clearAllNotifications(userId: string) {
  if (!userId) return { success: false, error: "No user ID" };
  
  const { error } = await supabaseAdmin
    .from('notifications')
    .delete()
    .eq('user_id', userId);
    
  if (error) {
    console.error("Failed to delete notifications:", error);
    return { success: false, error: error.message };
  }
  
  return { success: true };
}
