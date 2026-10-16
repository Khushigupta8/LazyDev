import { absoluteUrl } from '@/lib/site';

export default function sitemap() {
  const lastModified = new Date();
  return [
    { url: absoluteUrl('/'), lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/work'), lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: absoluteUrl('/privacy-policy'), lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
