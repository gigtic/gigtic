import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/_next');

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Security: Only allow specific admin emails to access the admin portal
  if (user) {
    const masterAdmins = ['vineethbpawar@gmail.com', 'gigtic.official@gmail.com', 'keepsmilling64@gmail.com'];
    const { data: isAdmin } = await supabase.rpc('check_admin_access');
    
    if (!masterAdmins.includes((user.email || '').toLowerCase()) && !isAdmin) {
      // If a regular user somehow logs in, immediately block them with a 403 Forbidden
      return new NextResponse(
        '403 Forbidden - You do not have administrator access to this portal.', 
        { status: 403 }
      )
    }
  }

  return supabaseResponse
}
