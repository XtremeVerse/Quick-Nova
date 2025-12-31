document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('json-input');
    const formatBtn = document.getElementById('format-btn');
    const minifyBtn = document.getElementById('minify-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const errorMsg = document.getElementById('error-msg');

    formatBtn.addEventListener('click', () => processJson(true));
    minifyBtn.addEventListener('click', () => processJson(false));

    clearBtn.addEventListener('click', () => {
        input.value = '';
        input.focus();
        errorMsg.style.display = 'none';
    });

    copyBtn.addEventListener('click', () => {
        if (input.value) {
            copyToClipboard(input.value);
        }
    });

    function processJson(beautify) {
        const raw = input.value.trim();
        if (!raw) return;

        try {
            const obj = JSON.parse(raw);
            const formatted = beautify ? JSON.stringify(obj, null, 4) : JSON.stringify(obj);
            input.value = formatted;
            errorMsg.style.display = 'none';
        } catch (e) {
            errorMsg.textContent = 'Invalid JSON: ' + e.message;
            errorMsg.style.display = 'block';
        }
    }
});
