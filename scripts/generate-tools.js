const fs = require('fs');
const path = require('path');

// Tools data structure
const toolsData = [
    // AI Tools
    { id: 'ai-chat', name: 'AI Chat', category: 'ai', desc: 'Chat with an intelligent AI assistant.', icon: '🤖', link: '/tools/ai-chat.html' },
    { id: 'ai-image-generator', name: 'AI Image Generator', category: 'ai', desc: 'Generate images from text prompts.', icon: '🎨', link: '/tools/ai-image-generator.html' },
    { id: 'text-summarizer', name: 'Text Summarizer', category: 'ai', desc: 'Summarize long texts instantly.', icon: '📝', link: '/tools/text-summarizer.html' },
    { id: 'text-rewriter', name: 'Text Rewriter', category: 'ai', desc: 'Rewrite text to improve clarity and style.', icon: '✍️', link: '/tools/text-rewriter.html' },
    { id: 'story-generator', name: 'Story Generator', category: 'ai', desc: 'Generate creative stories from prompts.', icon: '📖', link: '/tools/story-generator.html' },

    // Image Tools
    { id: 'background-remover', name: 'Background Remover', category: 'image', desc: 'Remove image backgrounds automatically.', icon: '🖼️', link: '/tools/background-remover.html' },
    { id: 'image-compressor', name: 'Image Compressor', category: 'image', desc: 'Compress images without losing quality.', icon: '📉', link: '/tools/image-compressor.html' },
    { id: 'image-resizer', name: 'Image Resizer', category: 'image', desc: 'Resize images to specific dimensions.', icon: '📏', link: '/tools/image-resizer.html' },
    { id: 'image-to-pdf', name: 'Image to PDF', category: 'image', desc: 'Convert images to PDF documents.', icon: '📄', link: '/tools/image-to-pdf.html' },
    { id: 'meme-generator', name: 'Meme Generator', category: 'image', desc: 'Create custom memes easily.', icon: '😂', link: '/tools/meme-generator.html' },

    // PDF Tools
    { id: 'pdf-compressor', name: 'PDF Compressor', category: 'pdf', desc: 'Reduce PDF file size.', icon: '🗜️', link: '/tools/pdf-compressor.html' },
    { id: 'pdf-to-word', name: 'PDF to Word', category: 'pdf', desc: 'Convert PDF files to Word documents.', icon: '📝', link: '/tools/pdf-to-word.html' },
    { id: 'word-to-pdf', name: 'Word to PDF', category: 'pdf', desc: 'Convert Word documents to PDF.', icon: '📑', link: '/tools/word-to-pdf.html' },
    { id: 'pdf-merge', name: 'PDF Merge', category: 'pdf', desc: 'Combine multiple PDFs into one.', icon: '🖇️', link: '/tools/pdf-merge.html' },
    { id: 'pdf-split', name: 'PDF Split', category: 'pdf', desc: 'Split a PDF into multiple files.', icon: '✂️', link: '/tools/pdf-split.html' },
    { id: 'text-to-pdf', name: 'Text to PDF', category: 'pdf', desc: 'Convert plain text to PDF.', icon: '📄', link: '/tools/text-to-pdf.html' },

    // Utility Tools
    { id: 'qr-code-generator', name: 'QR Code Generator', category: 'utility', desc: 'Generate QR codes for URLs and text.', icon: '📱', link: '/tools/qr-code-generator.html' },
    { id: 'password-generator', name: 'Password Generator', category: 'utility', desc: 'Generate strong, secure passwords.', icon: '🔒', link: '/tools/password-generator.html' },
    { id: 'url-shortener', name: 'URL Shortener', category: 'utility', desc: 'Shorten long URLs.', icon: '🔗', link: '/tools/url-shortener.html' },
    { id: 'color-picker', name: 'Color Picker', category: 'utility', desc: 'Pick and convert colors.', icon: '🎨', link: '/tools/color-picker.html' },
    { id: 'unit-converter', name: 'Unit Converter', category: 'utility', desc: 'Convert between different units.', icon: '⚖️', link: '/tools/unit-converter.html' },
    { id: 'time-zone-converter', name: 'Time Zone Converter', category: 'utility', desc: 'Convert time between zones.', icon: '🌍', link: '/tools/time-zone-converter.html' },
    { id: 'word-counter', name: 'Word Counter', category: 'utility', desc: 'Count words and characters.', icon: '1️⃣', link: '/tools/word-counter.html' },
    { id: 'character-counter', name: 'Character Counter', category: 'utility', desc: 'Count characters in text.', icon: '🔢', link: '/tools/character-counter.html' },
    { id: 'json-formatter', name: 'JSON Formatter', category: 'utility', desc: 'Format and validate JSON.', icon: '{ }', link: '/tools/json-formatter.html' },

    // Audio/Video Tools
    { id: 'audio-to-text', name: 'Audio to Text', category: 'audio-video', desc: 'Transcribe audio files to text.', icon: '🎙️', link: '/tools/audio-to-text.html' },
    { id: 'text-to-speech', name: 'Text to Speech', category: 'audio-video', desc: 'Convert text to spoken audio.', icon: '🔊', link: '/tools/text-to-speech.html' },
    { id: 'video-to-mp3', name: 'Video to MP3', category: 'audio-video', desc: 'Extract audio from video files.', icon: '🎵', link: '/tools/video-to-mp3.html' },
    { id: 'mp3-cutter', name: 'MP3 Cutter', category: 'audio-video', desc: 'Trim and cut MP3 audio files.', icon: '✂️', link: '/tools/mp3-cutter.html' },
    { id: 'voice-recorder', name: 'Voice Recorder', category: 'audio-video', desc: 'Record your voice online.', icon: '🎤', link: '/tools/voice-recorder.html' }
];

const toolsDir = path.join(__dirname, '../tools');
const jsToolsDir = path.join(__dirname, '../js/tools');

if (!fs.existsSync(toolsDir)) {
    fs.mkdirSync(toolsDir, { recursive: true });
}
if (!fs.existsSync(jsToolsDir)) {
    fs.mkdirSync(jsToolsDir, { recursive: true });
}

const template = (tool) => `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tool.name} - QuickNova</title>
    <meta name="description" content="${tool.desc} Free online tool.">
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- CSS -->
    <link rel="stylesheet" href="../css/theme.css">
    <link rel="stylesheet" href="../css/base.css">
    <link rel="stylesheet" href="../css/layout.css">
    <link rel="stylesheet" href="../css/components.css">
</head>
<body>
    <header class="site-header">
        <div class="container header-inner">
            <a href="/" class="logo">QuickNova</a>
            <nav class="nav-links">
                <a href="/">Home</a>
                <a href="/tools/">Tools</a>
                <a href="/about.html">About</a>
                <a href="/contact.html">Contact</a>
                <button class="theme-toggle" aria-label="Toggle Theme">🌙</button>
            </nav>
            <button class="mobile-menu-btn" aria-label="Menu">☰</button>
        </div>
    </header>

    <main class="main-content">
        <div class="container">
            <div class="tool-header">
                <span class="tool-badge">${formatCategory(tool.category)}</span>
                <h1 style="margin-top: 1rem;">${tool.name}</h1>
                <p style="color: var(--text-muted);">${tool.desc}</p>
            </div>

            <div class="tool-workspace">
                <div class="glass" style="padding: 3rem; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">${tool.icon}</div>
                    <h2>Coming Soon</h2>
                    <p style="margin-bottom: 2rem;">We are working hard to bring you this tool. Check back later!</p>
                    <button class="btn btn-primary" disabled>Coming Soon</button>
                </div>
            </div>

            <div class="ad-slot ad-content">
                <span>Advertisement</span>
            </div>
        </div>
    </main>

    <footer class="site-footer">
        <div class="container">
            <div class="footer-bottom">
                <p>&copy; 2025 QuickNova. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="../js/utils.js"></script>
    <script src="../js/main.js"></script>
    <!-- <script src="../js/tools/${tool.id}.js"></script> -->
</body>
</html>`;

function formatCategory(cat) {
    if (cat === 'ai') return 'AI Tool';
    if (cat === 'audio-video') return 'Audio / Video';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
}

toolsData.forEach(tool => {
    const fileName = tool.id + '.html';
    const filePath = path.join(toolsDir, fileName);

    // Only create if it doesn't exist
    if (!fs.existsSync(filePath)) {
        console.log(`Creating ${fileName}...`);
        fs.writeFileSync(filePath, template(tool));
        
        // Also create empty JS file for future implementation if needed, 
        // but for now we commented out the script tag in template to avoid 404s
        // const jsPath = path.join(jsToolsDir, tool.id + '.js');
        // if (!fs.existsSync(jsPath)) {
        //     fs.writeFileSync(jsPath, '// TODO: Implement ' + tool.name);
        // }
    } else {
        console.log(`Skipping ${fileName} (already exists)`);
    }
});

console.log('Done!');
