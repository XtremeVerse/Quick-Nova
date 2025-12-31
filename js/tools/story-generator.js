document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const promptInput = document.getElementById('prompt-input');
    const genreSelect = document.getElementById('genre-select');
    const toneSelect = document.getElementById('tone-select');
    const lengthSelect = document.getElementById('length-select');
    const protagonistInput = document.getElementById('protagonist-input');
    const settingInput = document.getElementById('setting-input');
    const generateBtn = document.getElementById('generate-btn');
    
    const storyOutput = document.getElementById('story-output');
    const storyTitle = document.getElementById('story-title');
    
    const copyBtn = document.getElementById('copy-btn');
    const downloadBtn = document.getElementById('download-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    // Load History
    loadHistory();

    // Actions
    copyBtn.addEventListener('click', () => {
        const text = storyOutput.innerText;
        if (!text || text.includes('Your story will be written here')) return;
        
        navigator.clipboard.writeText(text);
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied';
        setTimeout(() => copyBtn.textContent = originalText, 2000);
    });

    downloadBtn.addEventListener('click', () => {
        const text = storyOutput.innerText;
        const title = storyTitle.value;
        if (!text || text.includes('Your story will be written here')) return;

        const blob = new Blob([`${title}\n\n${text}`], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    });

    clearHistoryBtn.addEventListener('click', () => {
        if(confirm('Clear all story history?')) {
            localStorage.removeItem('quicknova_stories');
            loadHistory();
        }
    });

    // Main Generate Function
    generateBtn.addEventListener('click', async () => {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a story idea or prompt.');
            return;
        }

        setLoading(true);

        try {
            const fullPrompt = constructPrompt(prompt);
            
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are a bestselling author. Write creative, engaging, and well-structured stories. Do NOT include any meta-commentary like "Here is your story". Just write the story.' },
                        { role: 'user', content: fullPrompt }
                    ],
                    model: 'openai',
                    seed: Math.floor(Math.random() * 1000)
                })
            });

            if (!response.ok) throw new Error('API Error');

            let story = await response.text();
            
            // Basic formatting: ensure double newlines for paragraphs
            story = story.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');

            storyOutput.innerHTML = story;
            
            // Generate a title separately if not provided in the story (simple heuristic)
            // For now, we'll just use a generic title or the prompt snippet
            const title = `Story: ${prompt.substring(0, 20)}...`;
            storyTitle.value = title;

            // Save to history
            saveToHistory(prompt, story, title);

        } catch (error) {
            console.error(error);
            storyOutput.innerHTML = '<p style="color: var(--error);">Error generating story. Please try again later.</p>';
        } finally {
            setLoading(false);
        }
    });

    function constructPrompt(prompt) {
        const genre = genreSelect.value;
        const tone = toneSelect.value;
        const length = lengthSelect.value;
        const protagonist = protagonistInput.value.trim();
        const setting = settingInput.value.trim();

        let instruction = `Write a ${length.toLowerCase()} ${genre} story with a ${tone.toLowerCase()} tone. `;
        
        if (protagonist) instruction += `The protagonist is named ${protagonist}. `;
        if (setting) instruction += `The story is set in ${setting}. `;
        
        instruction += `\n\nStory Idea: ${prompt}\n\nWrite the story now.`;
        
        return instruction;
    }

    function setLoading(isLoading) {
        generateBtn.disabled = isLoading;
        generateBtn.textContent = isLoading ? 'Writing...' : 'Generate Story';
        if (isLoading) {
            storyOutput.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">The AI is writing your story...</p>';
            storyOutput.style.opacity = '0.7';
        } else {
            storyOutput.style.opacity = '1';
        }
    }

    function saveToHistory(prompt, story, title) {
        const history = JSON.parse(localStorage.getItem('quicknova_stories') || '[]');
        const newItem = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            prompt: prompt,
            story: story,
            title: title,
            meta: {
                genre: genreSelect.value,
                length: lengthSelect.value
            }
        };
        
        history.unshift(newItem);
        if (history.length > 10) history.pop(); // Keep last 10
        
        localStorage.setItem('quicknova_stories', JSON.stringify(history));
        loadHistory();
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('quicknova_stories') || '[]');
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; font-size:0.8rem; color:var(--text-muted);">No stories yet</p>';
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-title">${item.title}</div>
                <div class="history-meta">${item.meta.genre} • ${item.date}</div>
            `;
            
            div.addEventListener('click', () => {
                promptInput.value = item.prompt;
                storyOutput.innerHTML = item.story;
                storyTitle.value = item.title;
                
                // Restore settings (optional, but good for UX)
                if(item.meta && item.meta.genre) genreSelect.value = item.meta.genre;
                if(item.meta && item.meta.length) lengthSelect.value = item.meta.length;
            });

            historyList.appendChild(div);
        });
    }
});
