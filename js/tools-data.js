const toolsData = [
    // AI Tools
    { id: 'ai-chat', name: 'AI Chat', category: 'ai', desc: 'Professional AI assistant with personas & code support.', icon: '🤖', link: '/tools/ai-chat.html', keywords: 'ai chat, artificial intelligence, chatbot, gpt, free ai, coding assistant', badges: ['updated'] },
    { id: 'ai-image-generator', name: 'AI Image Generator', category: 'ai', desc: 'Generate art with styles & history.', icon: '🎨', link: '/tools/ai-image-generator.html', keywords: 'ai image generator, text to image, ai art, stable diffusion, free ai images', badges: ['updated'] },
    { id: 'text-summarizer', name: 'Text Summarizer', category: 'ai', desc: 'Summarize text with adjustable length & focus.', icon: '📝', link: '/tools/text-summarizer.html', keywords: 'text summarizer, summarize text, summary generator, ai summarizer', badges: ['updated'] },
    { id: 'text-rewriter', name: 'Text Rewriter', category: 'ai', desc: 'Rewrite text with different goals & tones.', icon: '✍️', link: '/tools/text-rewriter.html', keywords: 'text rewriter, article rewriter, paraphrase tool, ai writer', badges: ['updated'] },
    { id: 'story-generator', name: 'Story Generator', category: 'ai', desc: 'Generate creative stories with genre & tone control.', icon: '📖', link: '/tools/story-generator.html', keywords: 'story generator, ai story writer, plot generator, creative writing', badges: ['updated'] },

    // Image Tools
    { id: 'jpg-to-png', name: 'JPG to PNG', category: 'image', desc: 'Convert JPG images to PNG format.', icon: '🖼️', link: '/tools/jpg-to-png.html', keywords: 'jpg to png, convert jpg, image converter, batch converter', badges: ['new'] },
    { id: 'png-to-jpg', name: 'PNG to JPG', category: 'image', desc: 'Convert PNG images to JPG format.', icon: '🖼️', link: '/tools/png-to-jpg.html', keywords: 'png to jpg, convert png, image converter, batch converter', badges: ['new'] },
    { id: 'background-remover', name: 'Background Remover', category: 'image', desc: 'Remove image backgrounds automatically.', icon: '🖼️', link: '/tools/background-remover.html', keywords: 'background remover, remove background, transparent background, ai background removal' },
    { id: 'image-compressor', name: 'Image Compressor', category: 'image', desc: 'Compress images without losing quality.', icon: '📉', link: '/tools/image-compressor.html', keywords: 'image compressor, compress image, reduce image size, optimize image, jpeg compressor, png compressor' },
    { id: 'image-resizer', name: 'Image Resizer', category: 'image', desc: 'Resize images to specific dimensions.', icon: '📏', link: '/tools/image-resizer.html', keywords: 'image resizer, resize image, change image size, image dimensions' },
    { id: 'image-to-pdf', name: 'Image to PDF', category: 'image', desc: 'Convert images to PDF documents.', icon: '📄', link: '/tools/image-to-pdf.html', keywords: 'image to pdf, jpg to pdf, png to pdf, convert image to pdf', badges: ['new'] },
    { id: 'meme-generator', name: 'Meme Generator', category: 'image', desc: 'Create custom memes easily.', icon: '😂', link: '/tools/meme-generator.html', keywords: 'meme generator, make meme, meme maker, caption images' },

    // PDF Tools
    { id: 'pdf-to-image', name: 'PDF to Image', category: 'pdf', desc: 'Convert PDF pages to JPG/PNG images.', icon: '🖼️', link: '/tools/pdf-to-image.html', keywords: 'pdf to image, pdf to jpg, pdf to png, convert pdf to images', badges: ['new'] },
    { id: 'pdf-compressor', name: 'PDF Compressor', category: 'pdf', desc: 'Reduce PDF file size.', icon: '🗜️', link: '/tools/pdf-compressor.html', keywords: 'pdf compressor, compress pdf, reduce pdf size, optimize pdf' },
    { id: 'pdf-to-word', name: 'PDF to Word', category: 'pdf', desc: 'Convert PDF files to Word documents.', icon: '📝', link: '/tools/pdf-to-word.html', keywords: 'pdf to word, convert pdf to docx, pdf converter, edit pdf' },
    { id: 'word-to-pdf', name: 'Word to PDF', category: 'pdf', desc: 'Convert Word documents to PDF.', icon: '📑', link: '/tools/word-to-pdf.html', keywords: 'word to pdf, docx to pdf, convert word to pdf' },
    { id: 'pdf-merge', name: 'PDF Merge', category: 'pdf', desc: 'Combine multiple PDFs into one.', icon: '🖇️', link: '/tools/pdf-merge.html', keywords: 'pdf merge, combine pdf, join pdf, merge pdf files' },
    { id: 'pdf-split', name: 'PDF Split', category: 'pdf', desc: 'Split a PDF into multiple files.', icon: '✂️', link: '/tools/pdf-split.html', keywords: 'pdf split, split pdf pages, extract pdf pages, separate pdf' },
    { id: 'text-to-pdf', name: 'Text to PDF', category: 'pdf', desc: 'Convert plain text to PDF.', icon: '📄', link: '/tools/text-to-pdf.html', keywords: 'text to pdf, txt to pdf, convert text to pdf' },

    // Utility Tools
    { id: 'qr-code-generator', name: 'QR Code Generator', category: 'utility', desc: 'Generate QR codes for URLs and text.', icon: '📱', link: '/tools/qr-code-generator.html', keywords: 'qr code generator, make qr code, create qr code, free qr code', badges: ['popular'] },
    { id: 'password-generator', name: 'Password Generator', category: 'utility', desc: 'Generate strong, secure passwords.', icon: '🔒', link: '/tools/password-generator.html', keywords: 'password generator, strong password, secure password, random password', badges: ['popular'] },
    { id: 'url-shortener', name: 'URL Shortener', category: 'utility', desc: 'Shorten long URLs.', icon: '🔗', link: '/tools/url-shortener.html', keywords: 'url shortener, shorten link, link shortener, bitly alternative' },
    { id: 'color-picker', name: 'Color Picker', category: 'utility', desc: 'Pick and convert colors.', icon: '🎨', link: '/tools/color-picker.html', keywords: 'color picker, hex code, rgb to hex, color converter' },
    { id: 'unit-converter', name: 'Unit Converter', category: 'utility', desc: 'Convert between different units.', icon: '⚖️', link: '/tools/unit-converter.html', keywords: 'unit converter, measurement converter, length converter, weight converter' },
    { id: 'time-zone-converter', name: 'Time Zone Converter', category: 'utility', desc: 'Convert time between zones.', icon: '🌍', link: '/tools/time-zone-converter.html', keywords: 'time zone converter, world clock, time difference, est to pst' },
    { id: 'word-counter', name: 'Word Counter', category: 'utility', desc: 'Count words and characters.', icon: '1️⃣', link: '/tools/word-counter.html', keywords: 'word counter, character counter, letter count, word count tool' },
    { id: 'character-counter', name: 'Character Counter', category: 'utility', desc: 'Count characters in text.', icon: '🔢', link: '/tools/character-counter.html', keywords: 'character counter, text length, string length, count chars' },
    { id: 'json-formatter', name: 'JSON Formatter', category: 'utility', desc: 'Format and validate JSON.', icon: '{ }', link: '/tools/json-formatter.html', keywords: 'json formatter, json validator, beautify json, json parser' },

    // Audio/Video Tools
    { id: 'audio-to-text', name: 'Audio to Text', category: 'audio-video', desc: 'Transcribe audio files to text.', icon: '🎙️', link: '/tools/audio-to-text.html', keywords: 'audio to text, transcribe audio, speech to text, voice to text' },
    { id: 'text-to-speech', name: 'Text to Speech', category: 'audio-video', desc: 'Convert text to spoken audio.', icon: '🔊', link: '/tools/text-to-speech.html', keywords: 'text to speech, tts, read aloud, voice generator' },
    { id: 'video-to-mp3', name: 'Video to MP3', category: 'audio-video', desc: 'Extract audio from video files.', icon: '🎵', link: '/tools/video-to-mp3.html', keywords: 'video to mp3, extract audio, mp4 to mp3, video converter' },
    { id: 'mp3-cutter', name: 'MP3 Cutter', category: 'audio-video', desc: 'Trim and cut MP3 audio files.', icon: '✂️', link: '/tools/mp3-cutter.html', keywords: 'mp3 cutter, audio trimmer, cut audio, trim mp3' },
    { id: 'voice-recorder', name: 'Voice Recorder', category: 'audio-video', desc: 'Record your voice online.', icon: '🎤', link: '/tools/voice-recorder.html', keywords: 'voice recorder, audio recorder, record sound, online microphone' }
];

// Export for usage if using modules, but for vanilla JS we'll just use global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = toolsData;
}
