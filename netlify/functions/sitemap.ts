export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const baseUrl = 'https://zellonai.online';

  let businesses: any[] = [];
  
  try {
    if (projectId) {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'businesses' }],
            where: {
              fieldFilter: {
                field: { fieldPath: 'isActive' },
                op: 'EQUAL',
                value: { booleanValue: true }
              }
            }
          }
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          businesses = json
            .filter(item => item.document && item.document.fields)
            .map(item => {
              const fields = item.document.fields;
              return {
                id: item.document.name.split('/').pop(),
                slug: fields.slug?.stringValue,
                isActive: fields.isActive?.booleanValue,
                status: fields.status?.stringValue,
                address: fields.address?.stringValue,
                website: fields.website?.stringValue,
                updatedAt: fields.updatedAt?.timestampValue || item.document.updateTime
              };
            });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching businesses for sitemap:', error);
  }

  // Filter valid indexable businesses
  const validBusinesses = businesses.filter(b => 
    b.slug && 
    b.isActive !== false && 
    b.status !== 'suspended' &&
    (b.address || b.website) // AEO/GEO Quality Rule: Must have address or website to be indexed
  );

  const staticUrls = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${baseUrl}/privacy`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/terms`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/security`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}/google-guidelines`, priority: '0.6', changefreq: 'monthly' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Add static URLs
  for (const item of staticUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${item.loc}</loc>\n`;
    xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Add dynamic business URLs
  for (const b of validBusinesses) {
    const slug = encodeURIComponent(b.slug);
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/r/${slug}</loc>\n`;
    if (b.updatedAt) {
      xml += `    <lastmod>${new Date(b.updatedAt).toISOString()}</lastmod>\n`;
    }
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
};
