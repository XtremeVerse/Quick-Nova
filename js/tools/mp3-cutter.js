document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const editorContainer = document.getElementById('editor-container');
    const filenameDisplay = document.getElementById('filename-display');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const cutBtn = document.getElementById('cut-btn');
    const resetBtn = document.getElementById('reset-btn');
    const statusContainer = document.getElementById('status-container');
    const statusText = document.getElementById('status-text');
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');

    let wavesurfer = null;
    let wsRegions = null;
    let currentFile = null;
    let ffmpeg = null;

    // Initialize WaveSurfer with Regions on demand
    async function initWaveSurfer(url) {
        if (!window.WaveSurfer) {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.min.js';
                script.onload = resolve;
                document.body.appendChild(script);
            });
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/wavesurfer.js@7/dist/plugins/regions.min.js';
                script.onload = resolve;
                document.body.appendChild(script);
            });
        }

        if (wavesurfer) {
            wavesurfer.destroy();
        }

        wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#4a5568',
            progressColor: '#0070f3',
            cursorColor: '#0070f3',
            barWidth: 2,
            barGap: 3,
            barRadius: 3,
            height: 100,
            url: url,
        });

        // Initialize Regions Plugin
        const wsRegions = wavesurfer.registerPlugin(
            WaveSurfer.Regions.create()
        );

        // Add default region once ready
        wavesurfer.on('ready', () => {
            const duration = wavesurfer.getDuration();
            wsRegions.addRegion({
                start: 0,
                end: duration,
                color: 'rgba(0, 112, 243, 0.2)',
                drag: true,
                resize: true
            });
            
            startTimeInput.value = 0;
            endTimeInput.value = duration.toFixed(2);
            endTimeInput.max = duration;
            startTimeInput.max = duration;
        });

        // Update inputs on region update
        wsRegions.on('region-updated', (region) => {
            startTimeInput.value = region.start.toFixed(2);
            endTimeInput.value = region.end.toFixed(2);
        });

        // Update region on input change
        function updateRegion() {
            const regions = wsRegions.getRegions();
            if (regions.length > 0) {
                regions[0].setOptions({
                    start: parseFloat(startTimeInput.value),
                    end: parseFloat(endTimeInput.value)
                });
            }
        }

        startTimeInput.addEventListener('change', updateRegion);
        endTimeInput.addEventListener('change', updateRegion);

        // Play/Pause
        playPauseBtn.onclick = () => {
            wavesurfer.playPause();
            playPauseBtn.textContent = wavesurfer.isPlaying() ? '⏸' : '▶';
        };

        wavesurfer.on('finish', () => {
            playPauseBtn.textContent = '▶';
        });
        
        // Zoom
        let zoomLevel = 10;
        zoomInBtn.onclick = () => {
            zoomLevel += 5;
            wavesurfer.zoom(zoomLevel);
        };
        zoomOutBtn.onclick = () => {
            zoomLevel = Math.max(0, zoomLevel - 5);
            wavesurfer.zoom(zoomLevel);
        };
    }

    // Load FFmpeg
    async function loadFFmpeg() {
        if (ffmpeg) return ffmpeg;

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
        if (!file || !file.type.startsWith('audio/')) {
            alert('Please upload a valid audio file.');
            return;
        }

        currentFile = file;
        filenameDisplay.textContent = file.name;
        
        const url = URL.createObjectURL(file);
        initWaveSurfer(url);
        
        dropZone.style.display = 'none';
        editorContainer.style.display = 'block';
    }

    cutBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        try {
            cutBtn.disabled = true;
            statusContainer.style.display = 'block';
            statusText.textContent = 'Initializing...';
            progressBar.style.width = '0%';

            const { ffmpeg, fetchFile } = await loadFFmpeg();

            statusText.textContent = 'Trimming Audio...';
            
            const start = startTimeInput.value;
            const end = endTimeInput.value;
            const duration = (end - start).toFixed(2);

            // Write file
            const ext = currentFile.name.split('.').pop();
            const inputName = `input.${ext}`;
            const outputName = `output.${ext}`;
            
            await ffmpeg.writeFile(inputName, await fetchFile(currentFile));

            // Run FFmpeg
            // -ss: start time
            // -t: duration
            // -c copy: try to copy stream first (fastest)
            // Note: -c copy might be inaccurate for MP3, but let's try.
            // If we wanted frame-perfect accuracy we'd re-encode, but that takes longer.
            // Let's re-encode to be safe for web usage and accuracy.
            await ffmpeg.exec(['-i', inputName, '-ss', start, '-t', duration, outputName]);

            // Read result
            const data = await ffmpeg.readFile(outputName);

            // Create download link
            const blob = new Blob([data.buffer], { type: currentFile.type });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `trimmed-${currentFile.name}`;
            link.click();

            statusText.textContent = 'Done!';
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            showToast('Audio trimmed successfully!', 'success');
            
            cutBtn.disabled = false;

        } catch (error) {
            console.error(error);
            statusText.textContent = 'Error processing audio.';
            alert('An error occurred. Please check console.');
            cutBtn.disabled = false;
        }
    });

    resetBtn.addEventListener('click', () => {
        if (wavesurfer) wavesurfer.destroy();
        wavesurfer = null;
        dropZone.style.display = 'block';
        editorContainer.style.display = 'none';
        currentFile = null;
        fileInput.value = '';
        statusContainer.style.display = 'none';
    });
});
