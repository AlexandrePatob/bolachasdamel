import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/landing-content';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, priority: 1 }];
}
