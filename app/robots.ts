import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/', 
        '/scan/', 
        '/reports/', 
        '/history/', 
        '/settings/'
      ],
    },
    sitemap: 'https://phishdeep.vercel.app/sitemap.xml',
  }
}
