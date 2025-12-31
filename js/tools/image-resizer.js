document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const editorContainer = document.getElementById('editor-container');
    const previewImage = document.getElementById('preview-image');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const lockAspectRatioCheckbox = document.getElementById('lock-aspect-ratio');
    const percentageSlider = document.getElementById('percentage-slider');
    const percentageValue = document.getElementById('percentage-value');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resizeTypeRadios = document.getElementsByName('resize-type');
    const dimensionsControls = document.getElementById('dimensions-controls');
    const percentageControls = document.getElementById('percentage-controls');

    let originalImage = new Image();
    let originalWidth = 0;
    let originalHeight = 0;
    let currentFile = null;

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
            originalImage.src = e.target.result;
            originalImage.onload = () => {
                originalWidth = originalImage.width;
                originalHeight = originalImage.height;
                
                // Set initial values
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;
                previewImage.src = originalImage.src;
                
                dropZone.style.display = 'none';
                editorContainer.style.display = 'block';
            };
        };
        reader.readAsDataURL(file);
    }

    // Toggle Resize Type
    resizeTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'dimensions') {
                dimensionsControls.style.display = 'block';
                percentageControls.style.display = 'none';
                // Reset dimensions to current calculation from percentage if needed, 
                // but simpler to just reset to what they represent now.
                updateDimensionsFromPercentage();
            } else {
                dimensionsControls.style.display = 'none';
                percentageControls.style.display = 'block';
                // Reset percentage to 100 on switch? Or calculate?
                // Let's reset to 100 for simplicity or calculate based on current width ratio
                const ratio = parseInt(widthInput.value) / originalWidth;
                percentageSlider.value = Math.round(ratio * 100);
                percentageValue.textContent = percentageSlider.value + '%';
            }
        });
    });

    // Dimension Inputs
    widthInput.addEventListener('input', () => {
        if (lockAspectRatioCheckbox.checked && originalWidth > 0) {
            const ratio = originalHeight / originalWidth;
            heightInput.value = Math.round(widthInput.value * ratio);
        }
    });

    heightInput.addEventListener('input', () => {
        if (lockAspectRatioCheckbox.checked && originalHeight > 0) {
            const ratio = originalWidth / originalHeight;
            widthInput.value = Math.round(heightInput.value * ratio);
        }
    });

    // Percentage Slider
    percentageSlider.addEventListener('input', () => {
        percentageValue.textContent = percentageSlider.value + '%';
        updateDimensionsFromPercentage();
    });

    function updateDimensionsFromPercentage() {
        const percent = parseInt(percentageSlider.value) / 100;
        widthInput.value = Math.round(originalWidth * percent);
        heightInput.value = Math.round(originalHeight * percent);
    }

    // Reset
    resetBtn.addEventListener('click', () => {
        widthInput.value = originalWidth;
        heightInput.value = originalHeight;
        percentageSlider.value = 100;
        percentageValue.textContent = '100%';
        lockAspectRatioCheckbox.checked = true;
        
        // Reset radio to dimensions
        resizeTypeRadios[0].checked = true;
        dimensionsControls.style.display = 'block';
        percentageControls.style.display = 'none';
    });

    // Download
    downloadBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);

        if (!newWidth || !newHeight) return;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Better quality resizing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);

        // Determine format
        let format = currentFile.type;
        if (format === 'image/svg+xml') format = 'image/png'; // Convert SVG to PNG

        const link = document.createElement('a');
        link.download = 'resized-' + currentFile.name;
        link.href = canvas.toDataURL(format, 0.9);
        link.click();
        
        showToast('Image downloaded successfully!', 'success');
    });
});
