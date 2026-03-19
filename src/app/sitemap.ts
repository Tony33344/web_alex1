import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/constants';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://infinityroleteachers.com';

const staticPages = [
  '',
  '/role-teachers',
  '/role-teachers/testimonials',
  '/health',
  '/coach-training',
  '/events',
  '/membership',
  '/blog',
  '/contact',
  '/terms',
  '/privacy',
  '/login',
  '/register',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : page === '/blog' || page === '/events' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : page === '/membership' ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
