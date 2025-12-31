const fs = require('fs');
const path = require('path');
const toolsData = require('../js/tools-data.js');

const BASE_URL = 'https://quicknova.com'; // Change this to actual domain

function generateMetaTags(tool) {
    const title = `${tool.name} - QuickNova`;
    const description = tool.desc;
    const keywords = tool.keywords || '';
    const url = `${BASE_URL}${tool.link}`;
    const image = `${BASE_URL}/assets/og-image.jpg`; // Placeholder for now

    return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${image}">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${url}">
    <meta property="twitter:title" content="${title}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="${image}">
    
    <link rel="canonical" href="${url}">`;
}

toolsData.forEach(tool => {
    const filePath = path.join(__dirname, '..', tool.link.substring(1)); // remove leading slash
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove existing title and meta tags that we are about to replace
        // This regex is a bit aggressive, it looks for specific tags in the head
        
        // 1. Remove <title>...</title>
        content = content.replace(/<title>.*?<\/title>/s, '');
        
        // 2. Remove <meta name="description" ...>
        content = content.replace(/<meta\s+name=["']description["']\s+content=["'].*?["']\s*\/?>/g, '');
        
        // 3. Remove <meta name="keywords" ...>
        content = content.replace(/<meta\s+name=["']keywords["']\s+content=["'].*?["']\s*\/?>/g, '');
        
        // 4. Remove existing OG and Twitter tags if any (simplified)
        content = content.replace(/<meta\s+property=["']og:.*?["']\s+content=["'].*?["']\s*\/?>/g, '');
        content = content.replace(/<meta\s+property=["']twitter:.*?["']\s+content=["'].*?["']\s*\/?>/g, '');
        content = content.replace(/<link\s+rel=["']canonical["']\s+href=["'].*?["']\s*\/?>/g, '');

        // Insert new tags after <meta charset="..."> or at the beginning of <head>
        // Let's try to find a good injection point.
        // Usually after <meta charset="UTF-8"> and viewport
        
        const insertionPointRegex = /(<meta\s+name=["']viewport["'].*?>)/;
        const newTags = generateMetaTags(tool);
        
        if (insertionPointRegex.test(content)) {
            content = content.replace(insertionPointRegex, `$1\n${newTags}`);
        } else {
            // Fallback: prepend to <head>
            content = content.replace('<head>', `<head>\n${newTags}`);
        }
        
        // Clean up empty lines created by removals (optional but nice)
        content = content.replace(/^\s*[\r\n]/gm, '');

        fs.writeFileSync(filePath, content);
        console.log(`Updated meta tags for: ${tool.name}`);
    } else {
        console.warn(`File not found: ${filePath}`);
    }
});

console.log('All tool pages updated.');
