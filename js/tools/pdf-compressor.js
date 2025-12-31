document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const compressBtn = document.getElementById('compress-btn');
    const resultArea = document.getElementById('result-area');
    const compressionStats = document.getElementById('compression-stats');
    const downloadBtn = document.getElementById('download-btn');

    let currentFile = null;
    let optimizedPdfBytes = null;

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
        if (!file || file.type !== 'application/pdf') {
            alert('Please upload a valid PDF file.');
            return;
        }

        currentFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = formatBytes(file.size);
        
        fileInfo.style.display = 'block';
        dropZone.style.display = 'none';
        resultArea.style.display = 'none';
    }

    compressBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        compressBtn.disabled = true;
        compressBtn.textContent = 'Optimizing...';

        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            
            // "Compression" by saving (pdf-lib optimizes object structure on save)
            // To strip more, we could remove metadata, but let's keep it safe.
            // Using useObjectStreams: false might actually increase size, so default is usually best.
            // But we can try to copy pages to a new doc to ensure clean structure.
            
            const { PDFDocument } = PDFLib;
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach(page => newPdf.addPage(page));

            // Copy metadata if needed, but skipping it might save space
            // newPdf.setTitle(pdfDoc.getTitle());
            // newPdf.setAuthor(pdfDoc.getAuthor());

            optimizedPdfBytes = await newPdf.save();
            
            const originalSize = currentFile.size;
            const newSize = optimizedPdfBytes.byteLength;
            const savings = originalSize - newSize;
            const percent = ((savings / originalSize) * 100).toFixed(1);

            if (savings > 0) {
                compressionStats.textContent = `Reduced by ${formatBytes(savings)} (${percent}%)`;
                compressionStats.style.color = 'var(--accent-green)';
            } else {
                compressionStats.textContent = `No size reduction possible (already optimized)`;
                compressionStats.style.color = 'var(--text-muted)';
            }

            resultArea.style.display = 'block';
            fileInfo.style.display = 'none';

        } catch (error) {
            console.error('Error:', error);
            showToast('Error optimizing PDF', 'error');
            fileInfo.style.display = 'block';
        } finally {
            compressBtn.disabled = false;
            compressBtn.textContent = 'Optimize PDF';
        }
    });

    downloadBtn.addEventListener('click', () => {
        if (optimizedPdfBytes) {
            downloadFile(optimizedPdfBytes, `optimized-${currentFile.name}`, 'application/pdf');
        }
    });

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
});
