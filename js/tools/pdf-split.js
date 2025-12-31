document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const pageCountDisplay = document.getElementById('page-count');
    const splitMode = document.getElementById('split-mode');
    const rangeInputContainer = document.getElementById('range-input-container');
    const splitBtn = document.getElementById('split-btn');

    let currentFile = null;
    let totalPages = 0;

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

    async function handleFile(file) {
        if (!file || file.type !== 'application/pdf') {
            alert('Please upload a valid PDF file.');
            return;
        }

        currentFile = file;
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            totalPages = pdfDoc.getPageCount();

            fileName.textContent = file.name;
            pageCountDisplay.textContent = `${totalPages} pages`;
            fileInfo.style.display = 'block';
            dropZone.style.display = 'none';

        } catch (error) {
            console.error(error);
            alert('Error loading PDF. Please try another file.');
        }
    }

    splitMode.addEventListener('change', () => {
        if (splitMode.value === 'range') {
            rangeInputContainer.style.display = 'block';
        } else {
            rangeInputContainer.style.display = 'none';
        }
    });

    splitBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        splitBtn.disabled = true;
        splitBtn.textContent = 'Processing...';

        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            const { PDFDocument } = PDFLib;

            if (splitMode.value === 'all') {
                const zip = new JSZip();

                for (let i = 0; i < totalPages; i++) {
                    const newPdf = await PDFDocument.create();
                    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
                    newPdf.addPage(copiedPage);
                    const pdfBytes = await newPdf.save();
                    zip.file(`page-${i + 1}.pdf`, pdfBytes);
                }

                const content = await zip.generateAsync({ type: 'blob' });
                downloadFile(content, 'split-pages.zip', 'application/zip');
                showToast('All pages extracted to ZIP!', 'success');

            } else {
                // Range mode
                const rangeStr = document.getElementById('page-range').value.trim();
                const indices = parseRange(rangeStr, totalPages);
                
                if (indices.length === 0) {
                    alert('Invalid page range.');
                    splitBtn.disabled = false;
                    splitBtn.textContent = 'Split PDF';
                    return;
                }

                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(pdfDoc, indices);
                copiedPages.forEach(page => newPdf.addPage(page));

                const pdfBytes = await newPdf.save();
                downloadFile(pdfBytes, `split-${rangeStr}.pdf`, 'application/pdf');
                showToast('PDF split successfully!', 'success');
            }

        } catch (error) {
            console.error('Error:', error);
            showToast('Error processing PDF', 'error');
        } finally {
            splitBtn.disabled = false;
            splitBtn.textContent = 'Split PDF';
        }
    });

    function parseRange(rangeStr, max) {
        const indices = new Set();
        const parts = rangeStr.split(',');

        parts.forEach(part => {
            part = part.trim();
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        if (i >= 1 && i <= max) indices.add(i - 1);
                    }
                }
            } else {
                const num = Number(part);
                if (!isNaN(num) && num >= 1 && num <= max) {
                    indices.add(num - 1);
                }
            }
        });

        return Array.from(indices).sort((a, b) => a - b);
    }
});
