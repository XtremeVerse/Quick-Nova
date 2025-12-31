document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    
    const convertAllBtn = document.getElementById('convert-all-btn');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');

    // State
    let files = [];

    // --- Event Listeners ---

    // Dropzone Events
    dropzone.addEventListener('click', () => fileInput.click());
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; // Reset to allow re-selecting same files
    });

    // Buttons
    convertAllBtn.addEventListener('click', convertAllFiles);
    downloadAllBtn.addEventListener('click', downloadAllFiles);
    clearAllBtn.addEventListener('click', clearAllFiles);

    // --- Functions ---

    function handleFiles(fileListInput) {
        const newFiles = Array.from(fileListInput).filter(file => 
            file.type === 'image/jpeg' || file.type === 'image/jpg'
        );
        
        if (newFiles.length === 0) {
            if (fileListInput.length > 0) alert('Please select valid JPG/JPEG images.');
            return;
        }

        newFiles.forEach(file => {
            const fileObj = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                file: file,
                convertedBlob: null,
                status: 'pending' // pending, converting, done, error
            };
            files.push(fileObj);
            renderFileCard(fileObj);
        });

        updateUI();
    }

    function renderFileCard(fileObj) {
        const card = document.createElement('div');
        card.className = 'file-card';
        card.id = `card-${fileObj.id}`;

        const url = URL.createObjectURL(fileObj.file);

        card.innerHTML = `
            <button class="remove-btn" onclick="removeFile('${fileObj.id}')">×</button>
            <div class="file-preview">
                <img src="${url}" alt="${fileObj.file.name}">
            </div>
            <div class="file-info">
                <div class="file-name" title="${fileObj.file.name}">${fileObj.file.name}</div>
                <div class="file-meta">
                    <span>${formatSize(fileObj.file.size)}</span>
                    <span class="status-badge" style="color: var(--text-muted);">Ready</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn btn-sm btn-primary convert-single-btn" style="width: 100%;">Convert</button>
                <a class="btn btn-sm btn-secondary download-single-btn" style="display: none; width: 100%;">Download</a>
            </div>
        `;

        // Bind events
        card.querySelector('.convert-single-btn').addEventListener('click', () => convertFile(fileObj));
        card.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling if needed
            removeFile(fileObj.id);
        });

        fileList.appendChild(card);
    }

    window.removeFile = function(id) {
        const index = files.findIndex(f => f.id === id);
        if (index !== -1) {
            const card = document.getElementById(`card-${id}`);
            if (card) card.remove();
            files.splice(index, 1);
            updateUI();
        }
    };

    function clearAllFiles() {
        if (confirm('Remove all files?')) {
            files = [];
            fileList.innerHTML = '';
            updateUI();
        }
    }

    function updateUI() {
        const hasFiles = files.length > 0;
        const hasConverted = files.some(f => f.status === 'done');
        
        convertAllBtn.disabled = !hasFiles;
        downloadAllBtn.disabled = !hasConverted;
        clearAllBtn.disabled = !hasFiles;

        if (files.length === 0) {
            dropzone.style.display = 'flex';
        } else {
            dropzone.style.display = 'none';
        }
    }

    async function convertAllFiles() {
        convertAllBtn.disabled = true;
        convertAllBtn.textContent = 'Converting...';
        
        for (const fileObj of files) {
            if (fileObj.status !== 'done') {
                await convertFile(fileObj);
            }
        }
        
        convertAllBtn.disabled = false;
        convertAllBtn.textContent = 'Convert All';
        updateUI();
    }

    function convertFile(fileObj) {
        return new Promise((resolve) => {
            const card = document.getElementById(`card-${fileObj.id}`);
            const statusBadge = card.querySelector('.status-badge');
            const convertBtn = card.querySelector('.convert-single-btn');
            const downloadBtn = card.querySelector('.download-single-btn');

            fileObj.status = 'converting';
            statusBadge.textContent = 'Converting...';
            statusBadge.style.color = 'var(--primary)';
            convertBtn.disabled = true;

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                // Draw image directly (JPG has no transparency)
                ctx.drawImage(img, 0, 0);

                // Convert to PNG (lossless)
                canvas.toBlob((blob) => {
                    fileObj.convertedBlob = blob;
                    fileObj.status = 'done';
                    
                    statusBadge.textContent = 'Converted';
                    statusBadge.style.color = 'var(--success)';
                    
                    // Setup download button
                    const url = URL.createObjectURL(blob);
                    downloadBtn.href = url;
                    downloadBtn.download = fileObj.file.name.replace(/\.(jpg|jpeg)$/i, '') + '.png';
                    
                    convertBtn.style.display = 'none';
                    downloadBtn.style.display = 'inline-block';
                    
                    updateUI();
                    resolve();
                }, 'image/png');
            };
            
            img.onerror = () => {
                fileObj.status = 'error';
                statusBadge.textContent = 'Error';
                statusBadge.style.color = 'var(--error)';
                convertBtn.disabled = false;
                resolve();
            };

            img.src = URL.createObjectURL(fileObj.file);
        });
    }

    function downloadAllFiles() {
        const zip = new JSZip();
        const convertedFiles = files.filter(f => f.status === 'done' && f.convertedBlob);
        
        if (convertedFiles.length === 0) return;

        convertedFiles.forEach(f => {
            const fileName = f.file.name.replace(/\.(jpg|jpeg)$/i, '') + '.png';
            zip.file(fileName, f.convertedBlob);
        });

        downloadAllBtn.textContent = 'Zipping...';
        
        zip.generateAsync({type: 'blob'}).then(content => {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'quicknova-converted-images.zip';
            a.click();
            window.URL.revokeObjectURL(url);
            downloadAllBtn.textContent = 'Download All (ZIP)';
        });
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
});