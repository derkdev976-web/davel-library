import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Davel Library - Digital Library Management',
    short_name: 'Davel Library',
    description: 'A comprehensive library management system with digital catalog and modern features',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#8B4513',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/images/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/images/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/images/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/images/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    categories: ['education', 'books', 'library', 'productivity'],
    lang: 'en',
    dir: 'ltr',
    scope: '/',
    id: 'davel-library',
  }
}
