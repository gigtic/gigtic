import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/chat/', '/settings/'],
    },
    sitemap: 'https://gigtic.in/sitemap.xml',
  }
}
