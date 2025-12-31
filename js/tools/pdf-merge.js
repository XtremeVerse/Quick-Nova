document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const controls = document.getElementById('controls');
    const fileCount = document.getElementById('file-count');
    const mergeBtn = document.getElementById('merge-btn');

    let selectedFiles = [];

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
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        const validFiles = Array.from(files).filter(file => file.type === 'application/pdf');
        if (validFiles.length === 0) return;

        selectedFiles = [...selectedFiles, ...validFiles];
        updateUI();
    }

    function updateUI() {
        fileList.innerHTML = '';
        if (selectedFiles.length > 0) {
            controls.style.display = 'flex';
            fileCount.textContent = `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} selected`;
            
            selectedFiles.forEach((file, index) => {
                const div = document.createElement('div');
                div.className = 'glass';
                div.style.padding = '0.75rem 1rem';
                div.style.display = 'flex';
                div.style.justifyContent = 'space-between';
                div.style.alignItems = 'center';
                div.style.marginBottom = '0.5rem';

                const name = document.createElement('span');
                name.textContent = `${index + 1}. ${file.name}`;
                name.style.fontWeight = '500';

                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '×';
                removeBtn.style.background = 'none';
                removeBtn.style.border = 'none';
                removeBtn.style.color = 'var(--text-muted)';
                removeBtn.style.fontSize = '1.5rem';
                removeBtn.style.cursor = 'pointer';
                removeBtn.onclick = () => {
                    selectedFiles.splice(index, 1);
                    updateUI();
                };

                div.appendChild(name);
                div.appendChild(removeBtn);
                fileList.appendChild(div);
            });
        } else {
            controls.style.display = 'none';
        }
    }

    mergeBtn.addEventListener('click', async () => {
        if (selectedFiles.length < 2) {
            alert('Please select at least 2 PDF files to merge.');
            return;
        }

        // Loading State
        mergeBtn.disabled = true;
        mergeBtn.textContent = 'Merging...';

        try {
            const { PDFDocument } = PDFLib;
            const mergedPdf = await PDFDocument.create();

            for (const file of selectedFiles) {
                const fileArrayBuffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(fileArrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            downloadFile(pdfBytes, 'merged-document.pdf', 'application/pdf');
            showToast('PDFs merged successfully!', 'success');

        } catch (error) {
            console.error('Error:', error);
            showToast('Error merging PDFs. One of the files might be corrupted or encrypted.', 'error');
        } finally {
            mergeBtn.disabled = false;
            mergeBtn.textContent = 'Merge PDFs';
        }
    });
});
