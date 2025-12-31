document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const editorContainer = document.getElementById('editor-container');
    const originalPreview = document.getElementById('original-preview');
    const compressedPreview = document.getElementById('compressed-preview');
    const originalInfo = document.getElementById('original-info');
    const compressedInfo = document.getElementById('compressed-info');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const downloadBtn = document.getElementById('download-btn');
    const formatSelect = document.getElementById('format-select');

    let originalImage = new Image();
    let currentFile = null;
    let compressedDataUrl = null;

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
        const fileListEl = document.getElementById('file-list');
        if (fileListEl) {
            handleFiles(e.dataTransfer.files);
        } else {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        const fileListEl = document.getElementById('file-list');
        if (fileListEl) {
            handleFiles(e.target.files);
            fileInput.value = '';
        } else {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }

        currentFile = file;
        originalInfo.textContent = formatBytes(file.size);

        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalPreview.src = e.target.result;
            
            originalImage.onload = () => {
                compressImage();
                dropZone.style.display = 'none';
                editorContainer.style.display = 'block';
            };
        };
        reader.readAsDataURL(file);
    }

    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = qualitySlider.value + '%';
        if (window.compressTimeout) clearTimeout(window.compressTimeout);
        window.compressTimeout = setTimeout(compressImage, 100);
    });
    
    formatSelect.addEventListener('change', () => {
        if (window.compressTimeout) clearTimeout(window.compressTimeout);
        window.compressTimeout = setTimeout(compressImage, 100);
    });

    function compressImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        
        const quality = parseInt(qualitySlider.value) / 100;
        
        let type = 'image/jpeg';
        const selected = formatSelect ? formatSelect.value : 'auto';
        if (selected === 'webp') {
            type = 'image/webp';
        } else if (selected === 'jpeg') {
            type = 'image/jpeg';
        } else {
            if (currentFile.type === 'image/png' || currentFile.type === 'image/webp') {
                type = 'image/webp';
            } else {
                type = 'image/jpeg';
            }
        }
        
        compressedDataUrl = canvas.toDataURL(type, quality);
        compressedPreview.src = compressedDataUrl;
        
        // Calculate size
        const head = 'data:' + type + ';base64,';
        const size = Math.round((compressedDataUrl.length - head.length) * 3 / 4);
        
        compressedInfo.textContent = formatBytes(size);
        
        if (size < currentFile.size) {
            const savings = Math.round(((currentFile.size - size) / currentFile.size) * 100);
            compressedInfo.innerHTML = `${formatBytes(size)} <span style="font-size: 0.8em; color: var(--accent-green);">(-${savings}%)</span>`;
        } else {
            compressedInfo.style.color = 'var(--text-muted)';
        }
    }

    downloadBtn.addEventListener('click', () => {
        if (!compressedDataUrl) return;
        
        const link = document.createElement('a');
        let ext = '.jpg';
        const selected = formatSelect ? formatSelect.value : 'auto';
        if (selected === 'webp' || (selected === 'auto' && (currentFile.type === 'image/png' || currentFile.type === 'image/webp'))) {
            ext = '.webp';
        } else {
            ext = '.jpg';
        }
        
        link.download = 'compressed-' + currentFile.name.replace(/\.[^/.]+$/, "") + ext;
        link.href = compressedDataUrl;
        link.click();
        
        showToast('Image downloaded successfully!', 'success');
    });

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    const fileListEl = document.getElementById('file-list');
    const convertAllBtn = document.getElementById('convert-all-btn');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    let filesBatch = [];
    let qualityValueNum = parseInt(qualitySlider.value) / 100;
    let formatChoice = formatSelect ? formatSelect.value : 'auto';

    if (fileListEl) {
        qualitySlider.addEventListener('input', () => {
            qualityValue.textContent = qualitySlider.value + '%';
            qualityValueNum = parseInt(qualitySlider.value) / 100;
        });
        formatSelect.addEventListener('change', () => {
            formatChoice = formatSelect.value;
        });
        if (convertAllBtn) convertAllBtn.addEventListener('click', convertAllBatch);
        if (downloadAllBtn) downloadAllBtn.addEventListener('click', downloadAllBatch);
        if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllBatch);
    }

    function handleFiles(list) {
        const arr = Array.from(list).filter(f => f.type.startsWith('image/'));
        if (arr.length === 0) return;
        arr.forEach(f => {
            const id = Date.now() + Math.random().toString(36).slice(2, 9);
            const obj = { id, file: f, status: 'pending', convertedBlob: null, convertedType: null };
            filesBatch.push(obj);
            renderCard(obj);
        });
        updateBatchUI();
    }

    function renderCard(obj) {
        const reader = new FileReader();
        reader.onload = () => {
            const card = document.createElement('div');
            card.className = 'file-card';
            card.id = 'card-' + obj.id;
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            const preview = document.createElement('div');
            preview.className = 'file-preview';
            const img = document.createElement('img');
            img.src = reader.result;
            preview.appendChild(img);
            const info = document.createElement('div');
            info.className = 'file-info';
            const name = document.createElement('div');
            name.className = 'file-name';
            name.title = obj.file.name;
            name.textContent = obj.file.name;
            const meta = document.createElement('div');
            meta.className = 'file-meta';
            const sizeSpan = document.createElement('span');
            sizeSpan.textContent = formatBytes(obj.file.size);
            const statusSpan = document.createElement('span');
            statusSpan.className = 'status-badge';
            statusSpan.style.color = 'var(--text-muted)';
            statusSpan.textContent = 'Ready';
            meta.appendChild(sizeSpan);
            meta.appendChild(statusSpan);
            info.appendChild(name);
            info.appendChild(meta);
            const actions = document.createElement('div');
            actions.className = 'file-actions';
            const convertBtn = document.createElement('button');
            convertBtn.className = 'btn btn-sm btn-primary';
            convertBtn.textContent = 'Compress';
            convertBtn.style.width = '100%';
            const downloadLink = document.createElement('a');
            downloadLink.className = 'btn btn-sm btn-secondary';
            downloadLink.textContent = 'Download';
            downloadLink.style.display = 'none';
            downloadLink.style.width = '100%';
            actions.appendChild(convertBtn);
            actions.appendChild(downloadLink);
            card.appendChild(removeBtn);
            card.appendChild(preview);
            card.appendChild(info);
            card.appendChild(actions);
            fileListEl.appendChild(card);
            convertBtn.addEventListener('click', () => compressFileBatch(obj, statusSpan, convertBtn, downloadLink));
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = filesBatch.findIndex(x => x.id === obj.id);
                if (idx !== -1) {
                    filesBatch.splice(idx, 1);
                    card.remove();
                    updateBatchUI();
                }
            });
        };
        reader.readAsDataURL(obj.file);
    }

    function updateBatchUI() {
        const hasFiles = filesBatch.length > 0;
        const hasConverted = filesBatch.some(f => f.status === 'done');
        if (convertAllBtn) convertAllBtn.disabled = !hasFiles;
        if (downloadAllBtn) downloadAllBtn.disabled = !hasConverted;
        if (clearAllBtn) clearAllBtn.disabled = !hasFiles;
        dropZone.style.display = hasFiles ? 'none' : 'block';
    }

    function resolveTypeBatch(f) {
        if (formatChoice === 'webp') return 'image/webp';
        if (formatChoice === 'jpeg') return 'image/jpeg';
        if (f.file.type === 'image/png' || f.file.type === 'image/webp') return 'image/webp';
        return 'image/jpeg';
    }

    function compressFileBatch(obj, statusSpan, convertBtn, downloadLink) {
        const card = document.getElementById('card-' + obj.id);
        statusSpan = statusSpan || card.querySelector('.status-badge');
        convertBtn = convertBtn || card.querySelector('.btn.btn-sm.btn-primary');
        downloadLink = downloadLink || card.querySelector('a.btn.btn-sm.btn-secondary');
        obj.status = 'converting';
        statusSpan.textContent = 'Compressing...';
        statusSpan.style.color = 'var(--primary)';
        convertBtn.disabled = true;
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const type = resolveTypeBatch(obj);
            canvas.toBlob((blob) => {
                obj.convertedBlob = blob;
                obj.convertedType = type;
                obj.status = 'done';
                statusSpan.textContent = 'Compressed';
                statusSpan.style.color = 'var(--success)';
                const url = URL.createObjectURL(blob);
                downloadLink.href = url;
                const base = obj.file.name.replace(/\.[^/.]+$/, '');
                downloadLink.download = 'compressed-' + base + (type === 'image/webp' ? '.webp' : '.jpg');
                convertBtn.style.display = 'none';
                downloadLink.style.display = 'inline-block';
                updateBatchUI();
            }, type, qualityValueNum);
        };
        img.onerror = () => {
            obj.status = 'error';
            statusSpan.textContent = 'Error';
            statusSpan.style.color = 'var(--error)';
            convertBtn.disabled = false;
        };
        img.src = URL.createObjectURL(obj.file);
    }

    async function convertAllBatch() {
        if (!convertAllBtn) return;
        convertAllBtn.disabled = true;
        convertAllBtn.textContent = 'Compressing...';
        for (const f of filesBatch) {
            if (f.status !== 'done') {
                await new Promise((resolve) => {
                    const card = document.getElementById('card-' + f.id);
                    const statusSpan = card.querySelector('.status-badge');
                    const convertBtn = card.querySelector('.btn.btn-sm.btn-primary');
                    const downloadLink = card.querySelector('a.btn.btn-sm.btn-secondary');
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        const type = resolveTypeBatch(f);
                        canvas.toBlob((blob) => {
                            f.convertedBlob = blob;
                            f.convertedType = type;
                            f.status = 'done';
                            statusSpan.textContent = 'Compressed';
                            statusSpan.style.color = 'var(--success)';
                            const url = URL.createObjectURL(blob);
                            downloadLink.href = url;
                            const base = f.file.name.replace(/\.[^/.]+$/, '');
                            downloadLink.download = 'compressed-' + base + (type === 'image/webp' ? '.webp' : '.jpg');
                            convertBtn.style.display = 'none';
                            downloadLink.style.display = 'inline-block';
                            resolve();
                        }, type, qualityValueNum);
                    };
                    img.onerror = () => {
                        f.status = 'error';
                        statusSpan.textContent = 'Error';
                        statusSpan.style.color = 'var(--error)';
                        resolve();
                    };
                    img.src = URL.createObjectURL(f.file);
                });
            }
        }
        convertAllBtn.disabled = false;
        convertAllBtn.textContent = 'Convert All';
        updateBatchUI();
    }

    function downloadAllBatch() {
        if (!downloadAllBtn) return;
        const zip = new JSZip();
        const converted = filesBatch.filter(f => f.status === 'done' && f.convertedBlob);
        if (converted.length === 0) return;
        converted.forEach(f => {
            const base = f.file.name.replace(/\.[^/.]+$/, '');
            const name = 'compressed-' + base + (f.convertedType === 'image/webp' ? '.webp' : '.jpg');
            zip.file(name, f.convertedBlob);
        });
        downloadAllBtn.textContent = 'Zipping...';
        zip.generateAsync({ type: 'blob' }).then(content => {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'quicknova-compressed-images.zip';
            a.click();
            URL.revokeObjectURL(url);
            downloadAllBtn.textContent = 'Download All (ZIP)';
        });
    }

    function clearAllBatch() {
        filesBatch = [];
        if (fileListEl) fileListEl.innerHTML = '';
        updateBatchUI();
    }
});
