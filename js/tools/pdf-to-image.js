document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewArea = document.getElementById('preview-area');
    const pagesContainer = document.getElementById('pages-container');
    const convertBtn = document.getElementById('convert-btn');
    const formatSelect = document.getElementById('format-select');
    const scaleSelect = document.getElementById('scale-select');

    let currentFile = null;
    let pdfDoc = null;

    // --- Drag & Drop ---
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--accent-blue)';
        dropZone.style.background = 'var(--bg-elevated)';
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
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            handleFile(files[0]);
        } else {
            showToast('Please upload a PDF file.', 'error');
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    async function handleFile(file) {
        currentFile = file;
        previewArea.style.display = 'block';
        dropZone.style.display = 'none'; // Hide upload area to focus on content
        
        // Show loading state
        pagesContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading PDF...</div>';

        try {
            const arrayBuffer = await file.arrayBuffer();
            pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            renderPreviews();
            showToast(`Loaded ${pdfDoc.numPages} pages`, 'success');
        } catch (error) {
            console.error(error);
            showToast('Error loading PDF file.', 'error');
            pagesContainer.innerHTML = '';
            dropZone.style.display = 'flex';
        }
    }

    async function renderPreviews() {
        pagesContainer.innerHTML = '';
        const scale = 0.3; // Low res for thumbnail preview

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: scale });
            
            const wrapper = document.createElement('div');
            wrapper.className = 'page-preview fade-in';
            wrapper.style.position = 'relative';
            wrapper.style.border = '1px solid var(--border-subtle)';
            wrapper.style.borderRadius = '8px';
            wrapper.style.overflow = 'hidden';
            wrapper.style.background = 'var(--bg)';
            wrapper.style.cursor = 'pointer';
            wrapper.title = `Page ${i} - Click to download individually`;

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.width = '100%';
            canvas.style.height = 'auto';
            canvas.style.display = 'block';

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const label = document.createElement('div');
            label.textContent = `Page ${i}`;
            label.style.padding = '0.5rem';
            label.style.textAlign = 'center';
            label.style.fontSize = '0.8rem';
            label.style.borderTop = '1px solid var(--border-subtle)';
            label.style.background = 'var(--bg-elevated)';

            wrapper.appendChild(canvas);
            wrapper.appendChild(label);
            pagesContainer.appendChild(wrapper);

            // Click to download single page
            wrapper.addEventListener('click', () => downloadSinglePage(i));
        }
    }

    async function downloadSinglePage(pageNum) {
        if (!pdfDoc) return;
        
        showToast(`Converting Page ${pageNum}...`, 'info');
        
        const scale = parseFloat(scaleSelect.value);
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        const format = formatSelect.value;
        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        
        canvas.toBlob((blob) => {
            saveAs(blob, `page-${pageNum}.${format}`);
            triggerConfetti(); // Uses the utility we added earlier
        }, mimeType, 0.9);
    }

    // --- Bulk Convert ---
    convertBtn.addEventListener('click', async () => {
        if (!pdfDoc) return;

        const originalText = convertBtn.textContent;
        convertBtn.textContent = 'Processing...';
        convertBtn.disabled = true;

        try {
            const zip = new JSZip();
            const format = formatSelect.value;
            const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
            const scale = parseFloat(scaleSelect.value);

            for (let i = 1; i <= pdfDoc.numPages; i++) {
                // Update button progress
                convertBtn.textContent = `Processing Page ${i}/${pdfDoc.numPages}...`;
                
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: scale });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Add to zip
                const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, 0.9));
                zip.file(`page-${i}.${format}`, blob);
            }

            convertBtn.textContent = 'Zipping...';
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'quicknova-images.zip');
            
            triggerConfetti();
            showToast('Download started!', 'success');

        } catch (error) {
            console.error(error);
            showToast('Error during conversion.', 'error');
        } finally {
            convertBtn.textContent = originalText;
            convertBtn.disabled = false;
        }
    });
});