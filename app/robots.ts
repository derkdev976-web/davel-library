import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/api/',
        '/auth/',
        '/profile',
        '/chat',
        '/upload-test',
        '/test-*',
        '/debug-*',
        '/session-test',
      ],
    },
    sitemap: 'https://davel-library.vercel.app/sitemap.xml',
  }
}
