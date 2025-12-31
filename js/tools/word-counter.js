document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('text-input');
    const wordCount = document.getElementById('word-count');
    const charCount = document.getElementById('char-count');
    const sentenceCount = document.getElementById('sentence-count');
    const paragraphCount = document.getElementById('paragraph-count');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');

    if (input) {
        input.addEventListener('input', updateCounts);
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (input.value.trim()) {
                copyToClipboard(input.value);
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            updateCounts();
        });
    }

    function updateCounts() {
        const text = input.value;
        
        // Characters
        charCount.textContent = text.length;

        // Words
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        wordCount.textContent = words.length;

        // Sentences (approximate)
        const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
        sentenceCount.textContent = sentences.length;

        // Paragraphs
        const paragraphs = text.split(/\n+/).filter(para => para.trim().length > 0);
        paragraphCount.textContent = paragraphs.length;
    }
});
