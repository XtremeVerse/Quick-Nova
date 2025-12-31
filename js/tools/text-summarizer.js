document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const summaryOutput = document.getElementById('summary-output');
    const summarizeBtn = document.getElementById('summarize-btn');
    const clearTextBtn = document.getElementById('clear-text-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const inputCount = document.getElementById('input-count');
    const outputCount = document.getElementById('output-count');
    const focusSelect = document.getElementById('focus-select');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // State
    let state = {
        length: 'medium',
        format: 'paragraph'
    };

    // Load State and History
    loadHistory();

    // Event Listeners: Segmented Controls
    document.querySelectorAll('.segmented-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const group = e.target.closest('.segmented-control');
            group.querySelectorAll('.segmented-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            if (e.target.dataset.length) state.length = e.target.dataset.length;
            if (e.target.dataset.format) state.format = e.target.dataset.format;
        });
    });

    // Character Count
    textInput.addEventListener('input', () => {
        inputCount.textContent = `${textInput.value.length} characters`;
    });

    // Actions
    clearTextBtn.addEventListener('click', () => {
        textInput.value = '';
        inputCount.textContent = '0 characters';
        textInput.focus();
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            inputCount.textContent = `${text.length} characters`;
        } catch (err) {
            console.error('Failed to read clipboard', err);
            alert('Please allow clipboard access or use Ctrl+V');
        }
    });

    copyBtn.addEventListener('click', () => {
        if (!summaryOutput.value) return;
        navigator.clipboard.writeText(summaryOutput.value);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅';
        setTimeout(() => copyBtn.textContent = originalText, 2000);
    });

    downloadBtn.addEventListener('click', () => {
        if (!summaryOutput.value) return;
        const blob = new Blob([summaryOutput.value], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `summary-${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    });

    clearHistoryBtn.addEventListener('click', () => {
        if(confirm('Clear all history?')) {
            localStorage.removeItem('quicknova_summaries');
            loadHistory();
        }
    });

    // Main Summarize Function
    summarizeBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter some text to summarize.');
            return;
        }

        setLoading(true);

        try {
            const prompt = constructPrompt(text);
            
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are a professional summarizer tool. Output ONLY the summary without any conversational filler.' },
                        { role: 'user', content: prompt }
                    ],
                    model: 'openai',
                    seed: Math.floor(Math.random() * 1000)
                })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.text();
            summaryOutput.value = data;
            
            // Update word count
            const wordCount = data.trim().split(/\s+/).length;
            outputCount.textContent = `${wordCount} words`;

            // Save to history
            saveToHistory(text, data);

        } catch (error) {
            console.error(error);
            summaryOutput.value = 'Error generating summary. Please try again later.';
        } finally {
            setLoading(false);
        }
    });

    function constructPrompt(text) {
        let instruction = `Summarize the following text. `;
        
        // Length instruction
        if (state.length === 'short') instruction += `Keep it very concise (1-2 sentences). `;
        else if (state.length === 'medium') instruction += `Keep it moderate in length (1-2 paragraphs). `;
        else if (state.length === 'long') instruction += `Provide a detailed summary. `;

        // Format instruction
        if (state.format === 'bullets') instruction += `Format the output as a bulleted list. `;
        else instruction += `Format the output as coherent paragraphs. `;

        // Focus instruction
        const focus = focusSelect.value;
        if (focus === 'key_points') instruction += `Focus on extracting the main key points. `;
        else if (focus === 'action_items') instruction += `Focus on extracting actionable items, tasks, and next steps. `;
        else if (focus === 'simplified') instruction += `Explain it like I'm 5 (simple language). `;
        else instruction += `Provide a general overview. `;

        return `${instruction}\n\nTEXT:\n${text}`;
    }

    function setLoading(isLoading) {
        summarizeBtn.disabled = isLoading;
        summarizeBtn.textContent = isLoading ? 'Summarizing...' : 'Summarize Text';
        if (isLoading) {
            summaryOutput.value = 'Generating summary...';
            summaryOutput.style.opacity = '0.7';
        } else {
            summaryOutput.style.opacity = '1';
        }
    }

    function saveToHistory(original, summary) {
        const history = JSON.parse(localStorage.getItem('quicknova_summaries') || '[]');
        const newItem = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            preview: original.substring(0, 50) + '...',
            original: original,
            summary: summary,
            settings: { ...state, focus: focusSelect.value }
        };
        
        history.unshift(newItem);
        if (history.length > 10) history.pop(); // Keep last 10
        
        localStorage.setItem('quicknova_summaries', JSON.stringify(history));
        loadHistory();
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('quicknova_summaries') || '[]');
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; font-size:0.8rem; color:var(--text-muted);">No history yet</p>';
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-date">${item.date}</div>
                <div class="history-preview">${item.preview}</div>
            `;
            
            div.addEventListener('click', () => {
                textInput.value = item.original;
                summaryOutput.value = item.summary;
                inputCount.textContent = `${item.original.length} characters`;
                outputCount.textContent = `${item.summary.trim().split(/\s+/).length} words`;
                
                // Restore settings visual state
                // Note: We don't automatically trigger a new summary, just load the old one
            });

            historyList.appendChild(div);
        });
    }
});
