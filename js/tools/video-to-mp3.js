document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const editorContainer = document.getElementById('editor-container');
    const videoPreview = document.getElementById('video-preview');
    const filenameDisplay = document.getElementById('filename-display');
    const convertBtn = document.getElementById('convert-btn');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const statusContainer = document.getElementById('status-container');
    const statusText = document.getElementById('status-text');
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');

    let currentFile = null;
    let ffmpeg = null;

    // Load FFmpeg on demand
    async function loadFFmpeg() {
        if (ffmpeg) return ffmpeg;

        // Dynamic import of FFmpeg scripts from CDN
        if (!window.FFmpeg) {
            statusContainer.style.display = 'block';
            statusText.textContent = 'Loading conversion engine...';
            
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.7/dist/umd/ffmpeg.js';
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
            
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js';
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }

        const { FFmpeg } = window.FFmpeg;
        const { fetchFile } = window.FFmpegUtil;
        
        ffmpeg = new FFmpeg();
        
        ffmpeg.on('log', ({ message }) => {
            console.log(message);
        });

        ffmpeg.on('progress', ({ progress }) => {
            const pct = Math.round(progress * 100);
            progressBar.style.width = `${pct}%`;
            progressText.textContent = `${pct}%`;
        });

        await ffmpeg.load({
            coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
        });
        
        return { ffmpeg, fetchFile };
    }

    // Drag and Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent-blue)';
        dropZone.style.background = 'rgba(0, 112, 243, 0.05)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-subtle)';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-subtle)';
        dropZone.style.background = 'transparent';
        handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
    });

    function handleFile(file) {
        if (!file || !file.type.startsWith('video/')) {
            alert('Please upload a valid video file.');
            return;
        }

        currentFile = file;
        filenameDisplay.textContent = file.name;
        videoPreview.src = URL.createObjectURL(file);
        
        dropZone.style.display = 'none';
        editorContainer.style.display = 'block';
        downloadBtn.style.display = 'none';
        convertBtn.style.display = 'inline-block';
        convertBtn.disabled = false;
        statusContainer.style.display = 'none';
    }

    convertBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        try {
            convertBtn.disabled = true;
            statusContainer.style.display = 'block';
            statusText.textContent = 'Initializing...';
            progressBar.style.width = '0%';
            progressText.textContent = '0%';

            const { ffmpeg, fetchFile } = await loadFFmpeg();

            statusText.textContent = 'Converting...';
            
            // Write file to memory
            await ffmpeg.writeFile('input.mp4', await fetchFile(currentFile));

            // Run conversion
            // -vn: disable video recording
            // -acodec libmp3lame: use MP3 codec (or default)
            // -q:a 2: variable bit rate quality (0-9, 0 is best)
            await ffmpeg.exec(['-i', 'input.mp4', '-vn', '-acodec', 'libmp3lame', '-q:a', '2', 'output.mp3']);

            // Read result
            const data = await ffmpeg.readFile('output.mp3');

            // Create download link
            const blob = new Blob([data.buffer], { type: 'audio/mp3' });
            const url = URL.createObjectURL(blob);
            
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = url;
                link.download = currentFile.name.replace(/\.[^/.]+$/, "") + '.mp3';
                link.click();
            };

            downloadBtn.style.display = 'inline-block';
            convertBtn.style.display = 'none';
            statusText.textContent = 'Conversion Complete!';
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            showToast('Conversion successful!', 'success');

        } catch (error) {
            console.error(error);
            statusText.textContent = 'Error during conversion.';
            statusText.style.color = 'var(--accent-red)';
            alert('An error occurred. Please check console for details. Note: SharedArrayBuffer support is required for this tool.');
            convertBtn.disabled = false;
        }
    });

    resetBtn.addEventListener('click', () => {
        dropZone.style.display = 'block';
        editorContainer.style.display = 'none';
        videoPreview.src = '';
        currentFile = null;
        fileInput.value = '';
    });
});
