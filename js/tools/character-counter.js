document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const charNoSpaceCount = document.getElementById('char-no-space-count');
    const wordCount = document.getElementById('word-count');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Social Limits Elements
    const twitterCount = document.getElementById('twitter-count');
    const twitterBar = document.getElementById('twitter-bar');
    const instaCount = document.getElementById('insta-count');
    const instaBar = document.getElementById('insta-bar');
    const seoCount = document.getElementById('seo-count');
    const seoBar = document.getElementById('seo-bar');

    const LIMITS = {
        twitter: 280,
        insta: 150,
        seo: 60
    };

    function updateCounts() {
        const text = textInput.value;
        const chars = text.length;
        const charsNoSpace = text.replace(/\s/g, '').length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;

        // Update Basic Stats
        charCount.textContent = chars;
        charNoSpaceCount.textContent = charsNoSpace;
        wordCount.textContent = words;

        // Update Limits
        updateLimit(text.length, LIMITS.twitter, twitterCount, twitterBar);
        updateLimit(text.length, LIMITS.insta, instaCount, instaBar);
        updateLimit(text.length, LIMITS.seo, seoCount, seoBar);
    }

    function updateLimit(current, max, countElem, barElem) {
        countElem.textContent = `${current} / ${max}`;
        
        const percentage = Math.min((current / max) * 100, 100);
        barElem.style.width = `${percentage}%`;

        // Color coding
        if (current > max) {
            barElem.style.backgroundColor = 'var(--error)';
            countElem.style.color = 'var(--error)';
        } else if (current >= max * 0.9) {
            barElem.style.backgroundColor = 'var(--warning, #f59e0b)'; // Fallback to orange
            countElem.style.color = 'var(--text-color)';
        } else {
            // Reset to default colors based on ID
            if (barElem.id === 'twitter-bar') barElem.style.backgroundColor = 'var(--accent-blue)';
            else if (barElem.id === 'insta-bar') barElem.style.backgroundColor = 'var(--accent-purple)';
            else if (barElem.id === 'seo-bar') barElem.style.backgroundColor = 'var(--success, #10b981)'; // Fallback to green
            
            countElem.style.color = 'var(--text-color)';
        }
    }

    textInput.addEventListener('input', updateCounts);

    copyBtn.addEventListener('click', () => {
        if (textInput.value) {
            navigator.clipboard.writeText(textInput.value)
                .then(() => {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        }
    });

    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        updateCounts();
        textInput.focus();
    });

    // Initial update
    updateCounts();
});
