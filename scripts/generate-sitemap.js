const fs = require('fs');
const path = require('path');
const toolsData = require('../js/tools-data.js');

const siteUrl = 'https://quicknova.vercel.app';

const pages = [
  '/',
  '/tools/',
  '/dashboard.html',
  '/about.html',
  '/contact.html',
];

const toolPaths = (toolsData || []).map(t => t.link);

const urls = [...pages, ...toolPaths];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${siteUrl}${u}</loc></url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), xml);

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, '../robots.txt'), robots);

console.log('Sitemap and robots.txt generated');
