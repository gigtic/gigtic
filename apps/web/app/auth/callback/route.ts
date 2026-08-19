import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/explore'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.session?.user) {
      // Check if user has already set up their profile (has a nickname)
      const { data: profile } = await supabase
        .from('users')
        .select('nickname')
        .eq('id', data.session.user.id)
        .single()

      // If no nickname, they are new and need to finish onboarding
      if (!profile || !profile.nickname) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      // Profile exists, take them to the app
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=InvalidAuth`)
}
