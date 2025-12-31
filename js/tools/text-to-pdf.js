document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;
    const textInput = document.getElementById('pdf-text');
    const filenameInput = document.getElementById('filename');
    const downloadBtn = document.getElementById('download-btn');

    downloadBtn.addEventListener('click', () => {
        const text = textInput.value;
        if (!text.trim()) {
            alert('Please enter some text first.');
            return;
        }

        const doc = new jsPDF();
        
        // Set font
        doc.setFont("helvetica");
        doc.setFontSize(12);

        // Split text to fit page width
        // Page width is usually 210mm (A4), margins say 10mm each side -> 190mm usable
        const splitText = doc.splitTextToSize(text, 190);

        // Add text
        // If text is too long for one page, jsPDF usually needs manual handling or addPage
        // But for simplicity, we'll just add it and let it run off or basic handling
        // A better approach loop through lines
        
        let y = 10;
        const pageHeight = doc.internal.pageSize.height;
        const lineHeight = 7; // Approx for size 12

        splitText.forEach(line => {
            if (y > pageHeight - 10) {
                doc.addPage();
                y = 10;
            }
            doc.text(line, 10, y);
            y += lineHeight;
        });

        // Save
        let filename = filenameInput.value.trim() || 'document';
        if (!filename.endsWith('.pdf')) filename += '.pdf';
        
        doc.save(filename);
    });
});
