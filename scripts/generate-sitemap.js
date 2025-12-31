const fs = require('fs');
const path = require('path');
const toolsData = require('../js/tools-data.js');

const BASE_URL = 'https://quicknova.com'; // Change this to the actual domain
const TODAY = new Date().toISOString().split('T')[0];

const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/about.html', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact.html', priority: '0.8', changefreq: 'monthly' },
    { url: '/terms.html', priority: '0.5', changefreq: 'yearly' },
    { url: '/privacy.html', priority: '0.5', changefreq: 'yearly' },
];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// Add static pages
staticPages.forEach(page => {
    sitemap += `    <url>
        <loc>${BASE_URL}${page.url}</loc>
        <lastmod>${TODAY}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>
`;
});

// Add tool pages
toolsData.forEach(tool => {
    sitemap += `    <url>
        <loc>${BASE_URL}${tool.link}</loc>
        <lastmod>${TODAY}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
`;
});

sitemap += '</urlset>';

const sitemapPath = path.join(__dirname, '../sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap);

console.log(`Sitemap generated successfully at ${sitemapPath}`);
console.log(`Total URLs: ${staticPages.length + toolsData.length}`);
