import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Bell, CheckCircle2, Circle } from 'lucide-react'

export const metadata = {
  title: 'Notifications - GigTic',
  description: 'View your recent notifications',
}

export const runtime = 'edge';

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Mark all as read (fire and forget)
  if (notifications && notifications.length > 0) {
    supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .then()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-black text-white rounded-xl shadow-lg shadow-black/10">
          <Bell className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Notifications</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        {(!notifications || notifications.length === 0) ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No notifications yet</h3>
            <p className="text-gray-500 mt-1">When you get updates, they'll show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-5 flex items-start gap-4 transition-colors ${!notification.is_read ? 'bg-indigo-50/30' : 'hover:bg-gray-50'}`}
              >
                <div className="mt-1">
                  {!notification.is_read ? (
                    <Circle className="w-3 h-3 fill-indigo-500 text-indigo-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-[15px] leading-relaxed ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
