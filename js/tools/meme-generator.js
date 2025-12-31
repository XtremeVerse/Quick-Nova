document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const editorContainer = document.getElementById('editor-container');
    const canvas = document.getElementById('meme-canvas');
    const ctx = canvas.getContext('2d');
    
    // Controls
    const topTextInput = document.getElementById('top-text');
    const bottomTextInput = document.getElementById('bottom-text');
    const fontSizeInput = document.getElementById('font-size');
    const textColorInput = document.getElementById('text-color');
    const strokeColorInput = document.getElementById('stroke-color');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');

    let currentImage = new Image();
    let currentFileName = 'meme.png';

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

        currentFileName = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImage.src = e.target.result;
            currentImage.onload = () => {
                // Initialize canvas size
                // Limit max width to avoid huge canvases
                const maxWidth = 800;
                let width = currentImage.width;
                let height = currentImage.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                
                dropZone.style.display = 'none';
                editorContainer.style.display = 'block';
                drawMeme();
            };
        };
        reader.readAsDataURL(file);
    }

    // Event Listeners for controls
    const inputs = [topTextInput, bottomTextInput, fontSizeInput, textColorInput, strokeColorInput];
    inputs.forEach(input => {
        input.addEventListener('input', drawMeme);
    });

    function drawMeme() {
        if (!currentImage.src) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Image
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

        // Text Settings
        const fontSize = parseInt(fontSizeInput.value);
        ctx.font = `900 ${fontSize}px Impact, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = textColorInput.value;
        ctx.strokeStyle = strokeColorInput.value;
        ctx.lineWidth = fontSize / 15;
        ctx.lineJoin = 'round';

        // Draw Top Text
        const topText = topTextInput.value.toUpperCase();
        if (topText) {
            ctx.textBaseline = 'top';
            // Add some padding from top
            const y = canvas.height * 0.05; 
            const x = canvas.width / 2;
            
            ctx.strokeText(topText, x, y);
            ctx.fillText(topText, x, y);
        }

        // Draw Bottom Text
        const bottomText = bottomTextInput.value.toUpperCase();
        if (bottomText) {
            ctx.textBaseline = 'bottom';
            // Add some padding from bottom
            const y = canvas.height * 0.95;
            const x = canvas.width / 2;
            
            ctx.strokeText(bottomText, x, y);
            ctx.fillText(bottomText, x, y);
        }
    }

    // Download
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'meme-' + currentFileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Meme downloaded successfully!', 'success');
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        dropZone.style.display = 'block';
        editorContainer.style.display = 'none';
        topTextInput.value = '';
        bottomTextInput.value = '';
        fileInput.value = '';
        currentImage = new Image();
    });
});
