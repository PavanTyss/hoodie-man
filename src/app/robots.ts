import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://hoodieman.com'; // Change to your actual domain

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/checkout/',
          '/login/',
          '/register/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
