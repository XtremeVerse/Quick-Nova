document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const pageCountDisplay = document.getElementById('page-count');
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
        if (!file || file.type !== 'application/pdf') {
            alert('Please upload a valid PDF file.');
            return;
        }

        currentFile = file;
        fileName.textContent = file.name;
        
        // Count pages
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const typedarray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                pageCountDisplay.textContent = `${pdf.numPages} pages`;
                
                fileInfo.style.display = 'block';
                dropZone.style.display = 'none';
            } catch (error) {
                console.error(error);
                alert('Error reading PDF.');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    convertBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        convertBtn.disabled = true;
        convertBtn.textContent = 'Extracting text...';

        try {
            const arrayBuffer = await currentFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
            
            const paragraphs = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                
                // Simple text extraction - join items with space
                // Improvements could include checking transform for line breaks
                let lastY = -1;
                let textLine = [];

                for (const item of textContent.items) {
                    if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
                        // New line detected
                        if (textLine.length > 0) {
                            paragraphs.push(new docx.Paragraph({
                                children: [new docx.TextRun(textLine.join(' '))]
                            }));
                            textLine = [];
                        }
                    }
                    textLine.push(item.str);
                    lastY = item.transform[5];
                }
                
                // Push last line of page
                if (textLine.length > 0) {
                    paragraphs.push(new docx.Paragraph({
                        children: [new docx.TextRun(textLine.join(' '))]
                    }));
                }

                // Add page break if not last page
                if (i < pdf.numPages) {
                    paragraphs.push(new docx.Paragraph({
                        children: [new docx.PageBreak()]
                    }));
                }
            }

            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: paragraphs,
                }],
            });

            const blob = await docx.Packer.toBlob(doc);
            saveAs(blob, currentFile.name.replace('.pdf', '.docx'));
            
            showToast('Word document created!', 'success');

        } catch (error) {
            console.error('Error:', error);
            showToast('Error converting PDF', 'error');
        } finally {
            convertBtn.disabled = false;
            convertBtn.textContent = 'Convert to Word';
        }
    });
});
