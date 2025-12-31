document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const previewContainer = document.getElementById('preview-container');
    const convertBtn = document.getElementById('convert-btn');

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
        if (!file) return;
        
        const validTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.docx')) {
            alert('Please upload a valid .docx file.');
            return;
        }

        currentFile = file;
        fileName.textContent = file.name;
        
        // Show loading in preview
        previewContainer.innerHTML = '<p>Loading preview...</p>';
        fileInfo.style.display = 'block';
        dropZone.style.display = 'none';

        const reader = new FileReader();
        reader.onload = function(event) {
            const arrayBuffer = event.target.result;
            
            mammoth.convertToHtml({arrayBuffer: arrayBuffer})
                .then(displayResult)
                .catch(handleError);
        };
        reader.readAsArrayBuffer(file);
    }

    function displayResult(result) {
        previewContainer.innerHTML = result.value;
        // Basic styling for the preview to look more like a doc
        previewContainer.style.fontFamily = 'Arial, sans-serif';
        previewContainer.style.lineHeight = '1.6';
    }

    function handleError(err) {
        console.error(err);
        previewContainer.innerHTML = '<p style="color: red;">Error reading document.</p>';
        showToast('Error reading document', 'error');
    }

    convertBtn.addEventListener('click', () => {
        if (!currentFile || !previewContainer.innerHTML) return;

        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';

        const element = document.createElement('div');
        element.innerHTML = previewContainer.innerHTML;
        // Apply some print styles
        element.style.padding = '20px';
        element.style.fontFamily = 'Arial, sans-serif';
        element.style.fontSize = '12pt';
        element.style.color = 'black';
        element.style.background = 'white';

        const opt = {
            margin: 1,
            filename: currentFile.name.replace('.docx', '.pdf'),
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            showToast('PDF downloaded successfully!', 'success');
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert to PDF';
        }).catch(err => {
            console.error(err);
            showToast('Error converting to PDF', 'error');
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert to PDF';
        });
    });
});
