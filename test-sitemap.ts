import dotenv from 'dotenv';
dotenv.config();

import sitemap from './netlify/functions/sitemap.ts';

async function test() {
  const req = new Request('http://localhost/sitemap.xml', { method: 'GET' });
  const res = await sitemap(req);
  console.log('Status:', res.status);
  console.log(await res.text());
}
test();
