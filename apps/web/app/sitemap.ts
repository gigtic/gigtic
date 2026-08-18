import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gigtic.in'
  
  // Static routes
  const staticRoutes = [
    '',
    '/explore',
    '/about',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    // Dynamic Job routes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, created_at')
      .eq('status', 'OPEN')
      .limit(1000); // Max 1000 jobs in sitemap for now

    const jobRoutes = (jobs || []).map((job) => ({
      url: `${baseUrl}/job/${job.id}`,
      lastModified: new Date(job.created_at),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    }))

    return [...staticRoutes, ...jobRoutes]
  } catch (e) {
    // Fallback to static only if DB fetch fails during build
    return staticRoutes
  }
}
