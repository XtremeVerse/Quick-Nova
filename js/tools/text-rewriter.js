document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const textInput = document.getElementById('text-input');
    const rewriteOutput = document.getElementById('rewrite-output');
    const rewriteBtn = document.getElementById('rewrite-btn');
    
    const goalSelect = document.getElementById('goal-select');
    const toneSelect = document.getElementById('tone-select');
    
    const pasteBtn = document.getElementById('paste-btn');
    const clearTextBtn = document.getElementById('clear-text-btn');
    const copyBtn = document.getElementById('copy-btn');
    
    const inputStats = document.getElementById('input-stats');
    const outputStats = document.getElementById('output-stats');
    
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Load History
    loadHistory();

    // Stats Updater
    function updateStats(text, element) {
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        element.textContent = `${chars} chars | ${words} words`;
    }

    textInput.addEventListener('input', () => updateStats(textInput.value, inputStats));

    // Actions
    clearTextBtn.addEventListener('click', () => {
        textInput.value = '';
        updateStats('', inputStats);
        textInput.focus();
    });

    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
            updateStats(text, inputStats);
        } catch (err) {
            console.error('Failed to read clipboard', err);
            alert('Please allow clipboard access or use Ctrl+V');
        }
    });

    copyBtn.addEventListener('click', () => {
        if (!rewriteOutput.value) return;
        navigator.clipboard.writeText(rewriteOutput.value);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied';
        setTimeout(() => copyBtn.textContent = originalText, 2000);
    });

    clearHistoryBtn.addEventListener('click', () => {
        if(confirm('Clear all history?')) {
            localStorage.removeItem('quicknova_rewrites');
            loadHistory();
        }
    });

    // Main Rewrite Function
    rewriteBtn.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('Please enter some text to rewrite.');
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
                        { role: 'system', content: 'You are a professional editor and writing assistant. Output ONLY the rewritten text without any conversational filler, quotes, or preambles.' },
                        { role: 'user', content: prompt }
                    ],
                    model: 'openai',
                    seed: Math.floor(Math.random() * 1000)
                })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.text();
            rewriteOutput.value = data;
            updateStats(data, outputStats);

            // Save to history
            saveToHistory(text, data);

        } catch (error) {
            console.error(error);
            rewriteOutput.value = 'Error generating rewrite. Please try again later.';
        } finally {
            setLoading(false);
        }
    });

    function constructPrompt(text) {
        const goal = goalSelect.value;
        const tone = toneSelect.value;
        
        let instruction = "";

        // Goal Instruction
        switch(goal) {
            case 'improve':
                instruction = "Rewrite the following text to improve fluency, flow, and clarity. Fix any awkward phrasing.";
                break;
            case 'paraphrase':
                instruction = "Paraphrase the following text using different words and sentence structures while keeping the same meaning.";
                break;
            case 'shorten':
                instruction = "Condense the following text to be more concise. Remove unnecessary words and redundancy.";
                break;
            case 'expand':
                instruction = "Expand on the following text with more descriptive details, better transitions, and fuller sentences.";
                break;
            case 'simplify':
                instruction = "Rewrite the following text to be simple and easy to understand (ELI5 level). Use simple vocabulary.";
                break;
            case 'fix':
                instruction = "Fix all grammar, spelling, and punctuation errors in the following text. Do not change the style significantly.";
                break;
            default:
                instruction = "Rewrite the following text.";
        }

        // Tone Instruction
        if (tone) {
            instruction += ` Maintain a ${tone} tone throughout.`;
        }

        return `${instruction}\n\nTEXT:\n${text}`;
    }

    function setLoading(isLoading) {
        rewriteBtn.disabled = isLoading;
        rewriteBtn.textContent = isLoading ? 'Rewriting...' : 'Rewrite Text';
        if (isLoading) {
            rewriteOutput.value = 'Generating rewrite...';
            rewriteOutput.style.opacity = '0.7';
        } else {
            rewriteOutput.style.opacity = '1';
        }
    }

    function saveToHistory(original, rewritten) {
        const history = JSON.parse(localStorage.getItem('quicknova_rewrites') || '[]');
        const newItem = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            preview: original.substring(0, 40) + '...',
            original: original,
            rewritten: rewritten,
            goal: goalSelect.value,
            tone: toneSelect.value
        };
        
        history.unshift(newItem);
        if (history.length > 10) history.pop(); // Keep last 10
        
        localStorage.setItem('quicknova_rewrites', JSON.stringify(history));
        loadHistory();
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('quicknova_rewrites') || '[]');
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; font-size:0.8rem; color:var(--text-muted);">No history yet</p>';
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-meta">
                    <span>${item.date}</span>
                    <span style="text-transform: capitalize;">${item.goal}</span>
                </div>
                <div class="history-preview">${item.preview}</div>
            `;
            
            div.addEventListener('click', () => {
                textInput.value = item.original;
                rewriteOutput.value = item.rewritten;
                goalSelect.value = item.goal;
                toneSelect.value = item.tone;
                
                updateStats(item.original, inputStats);
                updateStats(item.rewritten, outputStats);
            });

            historyList.appendChild(div);
        });
    }
});
