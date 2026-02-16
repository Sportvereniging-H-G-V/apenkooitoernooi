import type { APIRoute } from 'astro';

const site = import.meta.env.SITE || 'https://apenkooitoernooi.nl';

const staticPages = [
  '',
  '/school-sporttoernooi',
  '/faq',
  '/contact',
  '/voorwaarden',
  '/bedankt',
];

export const GET: APIRoute = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (path) => `  <url>
    <loc>${site}${path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};

