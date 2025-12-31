document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('long-url');
    const shortenBtn = document.getElementById('shorten-btn');
    const clearBtn = document.getElementById('clear-btn');
    const resultCard = document.getElementById('result-card');
    const shortUrlEl = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');
    const openBtn = document.getElementById('open-btn');

    async function shorten() {
        const url = input.value.trim();
        if (!url) {
            showToast('Enter a URL', 'error');
            input.focus();
            return;
        }
        try {
            const encoded = encodeURIComponent(url);
            const api = `https://is.gd/create.php?format=simple&url=${encoded}`;
            const res = await fetch(api);
            if (!res.ok) throw new Error('API error');
            const short = await res.text();
            shortUrlEl.textContent = short;
            shortUrlEl.href = short;
            openBtn.href = short;
            resultCard.style.display = 'block';
            showToast('Short URL created', 'success');
        } catch (e) {
            showToast('Failed to shorten URL', 'error');
        }
    }

    shortenBtn.addEventListener('click', shorten);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') shorten();
    });
    clearBtn.addEventListener('click', () => {
        input.value = '';
        resultCard.style.display = 'none';
    });
    copyBtn.addEventListener('click', () => {
        const v = shortUrlEl.textContent;
        if (!v) return;
        navigator.clipboard.writeText(v).then(() => {
            showToast('Copied', 'success');
        }).catch(() => showToast('Copy failed', 'error'));
    });
});
