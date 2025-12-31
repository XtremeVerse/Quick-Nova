document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewArea = document.getElementById('preview-area');
    const controls = document.getElementById('controls');
    const fileCount = document.getElementById('file-count');
    const convertBtn = document.getElementById('convert-btn');
    
    // New Options
    const pageSizeSelect = document.getElementById('page-size');
    const orientationSelect = document.getElementById('orientation');
    const marginSelect = document.getElementById('margin');

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
        const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (validFiles.length === 0) return;

        selectedFiles = [...selectedFiles, ...validFiles];
        updateUI();
    }

    function updateUI() {
        previewArea.innerHTML = '';
        if (selectedFiles.length > 0) {
            controls.style.display = 'flex';
            fileCount.textContent = `${selectedFiles.length} image${selectedFiles.length !== 1 ? 's' : ''} selected`;
            
            selectedFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const div = document.createElement('div');
                    div.style.position = 'relative';
                    div.style.borderRadius = '8px';
                    div.style.overflow = 'hidden';
                    div.style.aspectRatio = '1';
                    div.style.border = '1px solid var(--border-subtle)';
                    div.style.background = 'var(--bg)';
                    div.draggable = true;
                    div.dataset.index = String(index);

                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';

                    const removeBtn = document.createElement('button');
                    removeBtn.innerHTML = '×';
                    removeBtn.style.position = 'absolute';
                    removeBtn.style.top = '5px';
                    removeBtn.style.right = '5px';
                    removeBtn.style.background = 'rgba(0,0,0,0.5)';
                    removeBtn.style.color = 'white';
                    removeBtn.style.border = 'none';
                    removeBtn.style.borderRadius = '50%';
                    removeBtn.style.width = '24px';
                    removeBtn.style.height = '24px';
                    removeBtn.style.cursor = 'pointer';
                    removeBtn.onclick = () => {
                        selectedFiles.splice(index, 1);
                        updateUI();
                    };

                    div.addEventListener('dragstart', (ev) => {
                        ev.dataTransfer.setData('text/plain', String(index));
                        ev.dataTransfer.effectAllowed = 'move';
                        div.style.opacity = '0.6';
                    });
                    div.addEventListener('dragover', (ev) => {
                        ev.preventDefault();
                        ev.dataTransfer.dropEffect = 'move';
                        div.style.outline = '2px dashed var(--accent-blue)';
                    });
                    div.addEventListener('dragleave', () => {
                        div.style.outline = 'none';
                    });
                    div.addEventListener('drop', (ev) => {
                        ev.preventDefault();
                        div.style.outline = 'none';
                        const from = parseInt(ev.dataTransfer.getData('text/plain'), 10);
                        const to = index;
                        if (!Number.isNaN(from) && from !== to) {
                            const item = selectedFiles.splice(from, 1)[0];
                            selectedFiles.splice(to, 0, item);
                            updateUI();
                        }
                    });
                    div.addEventListener('dragend', () => {
                        div.style.opacity = '1';
                        div.style.outline = 'none';
                    });

                    div.appendChild(img);
                    div.appendChild(removeBtn);
                    previewArea.appendChild(div);
                };
                reader.readAsDataURL(file);
            });
        } else {
            controls.style.display = 'none';
        }
    }

    convertBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;

        // Loading State
        const originalText = convertBtn.textContent;
        convertBtn.disabled = true;
        convertBtn.textContent = 'Generating PDF...';

        try {
            const { jsPDF } = window.jspdf;
            const pageSize = pageSizeSelect.value;
            const orientation = orientationSelect.value;
            const margin = parseInt(marginSelect.value);

            const doc = new jsPDF({
                orientation,
                unit: 'mm',
                format: pageSize
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            for (let i = 0; i < selectedFiles.length; i++) {
                if (i > 0) {
                    doc.addPage();
                }

                const imgData = await readFileAsDataURL(selectedFiles[i]);
                const imgProps = doc.getImageProperties(imgData);
                const imageType = selectedFiles[i].type.includes('png') ? 'PNG' : 'JPEG';

                const availWidth = pageWidth - (margin * 2);
                const availHeight = pageHeight - (margin * 2);
                
                let finalWidth = availWidth;
                let finalHeight = (imgProps.height * availWidth) / imgProps.width;

                if (finalHeight > availHeight) {
                    finalHeight = availHeight;
                    finalWidth = (imgProps.width * availHeight) / imgProps.height;
                }

                const x = (pageWidth - finalWidth) / 2;
                const y = (pageHeight - finalHeight) / 2;

                doc.addImage(imgData, imageType, x, y, finalWidth, finalHeight);
            }

            doc.save('quicknova-images.pdf');
            triggerConfetti();
            
        } catch (error) {
            console.error(error);
            alert('An error occurred while creating the PDF.');
        } finally {
            convertBtn.disabled = false;
            convertBtn.textContent = originalText;
        }
    });

    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
});
