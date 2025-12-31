import { pipeline, env, RawImage } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.14.0/dist/transformers.min.js';

// Configure environment
env.allowLocalModels = false;
env.useBrowserCache = true;

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const editorContainer = document.getElementById('editor-container');
    const originalPreview = document.getElementById('original-preview');
    const resultPreview = document.getElementById('result-preview');
    const resultCanvas = document.getElementById('result-canvas');
    const resultCtx = resultCanvas ? resultCanvas.getContext('2d') : null;
    const loadingSpinner = document.getElementById('loading-spinner');
    const loadingText = document.getElementById('loading-text');
    const processBtn = document.getElementById('process-btn');
    const downloadBtn = document.getElementById('download-btn');
    const thresholdSlider = document.getElementById('threshold-slider');
    const thresholdValue = document.getElementById('threshold-value');
    const featherSlider = document.getElementById('feather-slider');
    const featherValue = document.getElementById('feather-value');

    let currentFile = null;
    let segmenter = null;
    let originalImageData = null;
    let workingImageData = null;
    let brushMode = 'erase';
    let isDrawing = false;

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
        if (!file || !file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }

        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            originalPreview.src = e.target.result;
            // Also store as RawImage for transformers if needed, but we can read from src
            
            dropZone.style.display = 'none';
            editorContainer.style.display = 'block';
            resultPreview.style.display = 'none';
            downloadBtn.disabled = true;
        };
        reader.readAsDataURL(file);
    }

    thresholdSlider.addEventListener('input', () => {
        thresholdValue.textContent = thresholdSlider.value + '%';
    });

    featherSlider.addEventListener('input', () => {
        featherValue.textContent = featherSlider.value + 'px';
    });
    
    const brushControls = document.getElementById('brush-controls');
    const eraseBtn = document.getElementById('erase-btn');
    const restoreBtn = document.getElementById('restore-btn');
    const resetEditsBtn = document.getElementById('reset-edits-btn');
    const brushSizeInput = document.getElementById('brush-size');
    const brushSizeValue = document.getElementById('brush-size-value');
    if (brushSizeInput && brushSizeValue) {
        brushSizeInput.addEventListener('input', () => {
            brushSizeValue.textContent = brushSizeInput.value + 'px';
        });
    }
    if (eraseBtn && restoreBtn) {
        eraseBtn.addEventListener('click', () => {
            brushMode = 'erase';
            eraseBtn.classList.add('btn-primary');
            restoreBtn.classList.remove('btn-primary');
        });
        restoreBtn.addEventListener('click', () => {
            brushMode = 'restore';
            restoreBtn.classList.add('btn-primary');
            eraseBtn.classList.remove('btn-primary');
        });
    }
    if (resetEditsBtn) {
        resetEditsBtn.addEventListener('click', () => {
            if (!originalImageData || !resultCtx) return;
            workingImageData = new ImageData(new Uint8ClampedArray(originalImageData.data), originalImageData.width, originalImageData.height);
            resultCtx.putImageData(workingImageData, 0, 0);
        });
    }

    processBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        processBtn.disabled = true;
        resultPreview.style.display = 'none';
        loadingSpinner.style.display = 'flex';
        loadingText.textContent = 'Loading AI Model (this may take a while)...';

        try {
            // Load model if not already loaded
            if (!segmenter) {
                segmenter = await pipeline('image-segmentation', 'Xenova/modnet', {
                    progress_callback: (data) => {
                        if (data.status === 'progress') {
                            const percent = Math.round(data.progress * 100);
                            loadingText.textContent = `Loading Model: ${percent}%`;
                        }
                    }
                });
            }

            loadingText.textContent = 'Removing Background...';

            // Run inference
            // Convert image source to blob/url for the pipeline
            const output = await segmenter(originalPreview.src);
            
            // Output is usually a mask (RawImage) or similar depending on pipeline
            // For modnet, it returns a mask.
            
            // We need to apply this mask to the original image
            await applyMask(output);

        } catch (error) {
            console.error('Error:', error);
            alert('Error removing background. Please try a different image or check your connection.');
            loadingSpinner.style.display = 'none';
            processBtn.disabled = false;
        }
    });

    async function applyMask(mask) {
        // mask is likely a RawImage or Tensor
        // Let's create a canvas to compose
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = originalPreview.src;
        
        await new Promise(resolve => img.onload = resolve);
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelData = imageData.data;
        
        // The mask from modnet might be a RawImage or just a mask object
        // output.mask is the RawImage usually
        // Let's inspect what 'output' is. For 'image-segmentation', it's usually { mask: RawImage } or just RawImage
        
        // Ensure mask is resized to match image if needed, but usually pipeline handles it?
        // Actually, modnet output is a matte.
        // Let's handle the mask data.
        
        // NOTE: transformers.js image-segmentation output structure varies by model.
        // For modnet, it returns a mask image.
        
        // Let's convert the mask to a canvas to read its data easily
        const maskCanvas = document.createElement('canvas');
        const m = mask.mask ? mask.mask : mask;
        maskCanvas.width = m.width;
        maskCanvas.height = m.height;
        const maskCtx = maskCanvas.getContext('2d');
        
        // Put mask data
        // mask.data is a Uint8Array (grayscale)
        // We need to create ImageData
        const maskImageData = new ImageData(m.width, m.height);
        
        // If mask.data is single channel (grayscale), we need to fill RGBA
        // transformers.js RawImage data is usually RGBA or specific channels
        // modnet returns a matte, likely 1 channel or 3 channels grayscale.
        
        // Check channels
        if (m.channels === 1) {
            for (let i = 0; i < m.data.length; i++) {
                const val = m.data[i];
                maskImageData.data[i * 4] = val;     // R
                maskImageData.data[i * 4 + 1] = val; // G
                maskImageData.data[i * 4 + 2] = val; // B
                maskImageData.data[i * 4 + 3] = 255; // A
            }
        } else {
             // Assume RGBA or RGB
             for (let i = 0; i < maskImageData.data.length; i++) {
                 maskImageData.data[i] = m.data[i];
             }
        }
        
        maskCtx.putImageData(maskImageData, 0, 0);
        
        // Resize mask to fit original image if different
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        const feather = parseInt(featherSlider.value);
        tempCtx.filter = feather > 0 ? `blur(${feather}px)` : 'none';
        tempCtx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
        
        // Get resized mask data
        const resizedMaskData = tempCtx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        // Apply alpha to original image data
        for (let i = 0; i < pixelData.length; i += 4) {
            const alpha = resizedMaskData[i];
            const t = Math.round((parseInt(thresholdSlider.value) / 100) * 255);
            pixelData[i + 3] = alpha >= t ? alpha : 0;
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        if (resultCanvas && resultCtx) {
            resultCanvas.width = canvas.width;
            resultCanvas.height = canvas.height;
            workingImageData = imageData;
            originalImageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
            resultCtx.putImageData(workingImageData, 0, 0);
            resultCanvas.style.display = 'block';
            if (brushControls) brushControls.style.display = 'block';
            setupBrush();
        } else {
            const resultUrl = canvas.toDataURL('image/png');
            resultPreview.src = resultUrl;
            resultPreview.style.display = 'block';
        }
        loadingSpinner.style.display = 'none';
        processBtn.disabled = false;
        downloadBtn.disabled = false;
        
        downloadBtn.onclick = () => {
            const link = document.createElement('a');
            link.download = 'removed-bg-' + currentFile.name.replace(/\.[^/.]+$/, "") + '.png';
            const url = resultCanvas && resultCtx ? resultCanvas.toDataURL('image/png') : resultPreview.src;
            link.href = url;
            link.click();
        };
    }
    
    function setupBrush() {
        if (!resultCanvas || !resultCtx) return;
        const getPos = (ev) => {
            const rect = resultCanvas.getBoundingClientRect();
            const x = (ev.clientX - rect.left) * (resultCanvas.width / rect.width);
            const y = (ev.clientY - rect.top) * (resultCanvas.height / rect.height);
            return { x: Math.round(x), y: Math.round(y) };
        };
        const draw = (ev) => {
            if (!isDrawing || !workingImageData) return;
            const { x, y } = getPos(ev);
            const r = parseInt(brushSizeInput.value);
            const w = workingImageData.width;
            const h = workingImageData.height;
            const data = workingImageData.data;
            const minX = Math.max(0, x - r);
            const maxX = Math.min(w - 1, x + r);
            const minY = Math.max(0, y - r);
            const maxY = Math.min(h - 1, y + r);
            for (let yy = minY; yy <= maxY; yy++) {
                for (let xx = minX; xx <= maxX; xx++) {
                    const dx = xx - x;
                    const dy = yy - y;
                    if (dx * dx + dy * dy <= r * r) {
                        const idx = (yy * w + xx) * 4 + 3;
                        data[idx] = brushMode === 'erase' ? 0 : 255;
                    }
                }
            }
            resultCtx.putImageData(workingImageData, 0, 0);
        };
        resultCanvas.addEventListener('mousedown', (e) => { isDrawing = true; draw(e); });
        resultCanvas.addEventListener('mousemove', draw);
        window.addEventListener('mouseup', () => { isDrawing = false; });
        resultCanvas.addEventListener('touchstart', (e) => { isDrawing = true; draw(e.touches[0]); });
        resultCanvas.addEventListener('touchmove', (e) => { draw(e.touches[0]); });
        window.addEventListener('touchend', () => { isDrawing = false; });
    }
});
