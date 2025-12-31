document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const promptInput = document.getElementById('prompt-input');
    const styleSelect = document.getElementById('style-select');
    const generateBtn = document.getElementById('generate-btn');
    const imageContainer = document.getElementById('image-container');
    const downloadBtn = document.getElementById('download-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const actionBar = document.getElementById('action-bar');
    const historyGrid = document.getElementById('history-grid');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const widthInput = document.getElementById('width-input');
    const heightInput = document.getElementById('height-input');
    const dimBtns = document.querySelectorAll('.dim-btn');
    const loader = document.querySelector('.loader');
    const btnText = document.querySelector('.btn-text');

    // --- State ---
    let currentImageBlob = null;
    let currentImageUrl = null;

    // --- Initialization ---
    loadHistory();
    
    // --- Event Listeners ---
    
    // Dimension selection
    dimBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dimBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            widthInput.value = btn.dataset.w;
            heightInput.value = btn.dataset.h;
        });
    });

    // Generate Button
    generateBtn.addEventListener('click', generateImage);
    
    // Enter key in prompt (if not shift+enter)
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateImage();
        }
    });

    // Download
    downloadBtn.addEventListener('click', () => {
        if (currentImageUrl) {
            const a = document.createElement('a');
            a.href = currentImageUrl;
            a.download = `quicknova-art-${Date.now()}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            triggerConfetti();
        }
    });

    // Fullscreen
    fullscreenBtn.addEventListener('click', () => {
        const img = imageContainer.querySelector('img');
        if (img) {
            if (img.requestFullscreen) img.requestFullscreen();
            else if (img.webkitRequestFullscreen) img.webkitRequestFullscreen();
            else if (img.msRequestFullscreen) img.msRequestFullscreen();
        }
    });

    // Clear History
    clearHistoryBtn.addEventListener('click', () => {
        if(confirm('Clear all generated history?')) {
            localStorage.removeItem('quicknova_ai_images');
            loadHistory();
        }
    });


    // --- Core Functions ---

    async function generateImage() {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showToast('Please enter a prompt first!', 'error');
            promptInput.focus();
            return;
        }

        // Set Loading State
        setLoading(true);
        actionBar.style.display = 'none';
        imageContainer.innerHTML = ''; // Clear current

        try {
            const width = widthInput.value;
            const height = heightInput.value;
            const seed = Math.floor(Math.random() * 1000000);
            
            // Construct full prompt with style
            let fullPrompt = prompt;
            if (styleSelect.value) {
                fullPrompt += `, ${styleSelect.value} style, high quality, detailed`;
            }

            // Using Pollinations.ai
            const encodedPrompt = encodeURIComponent(fullPrompt);
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

            // Fetch image as blob to enable proper download and storage
            const response = await fetch(url);
            if (!response.ok) throw new Error('Generation failed');
            
            const blob = await response.blob();
            currentImageBlob = blob;
            currentImageUrl = URL.createObjectURL(blob);

            // Display Image
            const img = new Image();
            img.onload = () => {
                setLoading(false);
                imageContainer.appendChild(img);
                actionBar.style.display = 'flex';
                
                // Save to history
                saveToHistory(currentImageUrl, prompt, seed);
                triggerConfetti();
            };
            img.src = currentImageUrl;

        } catch (error) {
            console.error(error);
            setLoading(false);
            imageContainer.innerHTML = `
                <div class="placeholder-content">
                    <div class="placeholder-icon">⚠️</div>
                    <p style="color: var(--error)">Failed to generate image. Please try again.</p>
                </div>
            `;
            showToast('Generation failed. Please try again.', 'error');
        }
    }

    function setLoading(isLoading) {
        generateBtn.disabled = isLoading;
        if (isLoading) {
            loader.style.display = 'inline-block';
            btnText.textContent = 'Generating...';
            imageContainer.classList.remove('empty');
            imageContainer.innerHTML = '<div class="spinner" style="width: 50px; height: 50px; border-width: 4px;"></div>';
        } else {
            loader.style.display = 'none';
            btnText.textContent = 'Generate Art';
        }
    }

    function saveToHistory(url, prompt, seed) {
        // We can't store blobs easily in localStorage, so we'll store the URL parameters to recreate it
        // Or store a small number of base64 thumbnails if we want to be fancy.
        // For now, let's store the generation parameters.
        
        const historyItem = {
            id: Date.now(),
            prompt: prompt,
            style: styleSelect.value,
            width: widthInput.value,
            height: heightInput.value,
            seed: seed,
            timestamp: Date.now()
        };

        let history = JSON.parse(localStorage.getItem('quicknova_ai_images') || '[]');
        history.unshift(historyItem);
        if (history.length > 20) history.pop(); // Limit to 20
        
        localStorage.setItem('quicknova_ai_images', JSON.stringify(history));
        loadHistory();
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('quicknova_ai_images') || '[]');
        historyGrid.innerHTML = '';

        if (history.length === 0) {
            historyGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 0.8rem; color: var(--text-muted);">No history yet</p>';
            return;
        }

        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-thumb';
            div.title = item.prompt;
            
            // Reconstruct URL for thumbnail
            const encodedPrompt = encodeURIComponent(item.prompt + (item.style ? `, ${item.style} style, high quality, detailed` : ''));
            // Use smaller dimension for thumbnail to save bandwidth? Pollinations generates on fly.
            // Let's just use the original params but maybe request smaller if possible, 
            // but consistency requires same params.
            const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${item.width}&height=${item.height}&seed=${item.seed}&nologo=true&model=flux`;
            
            const img = document.createElement('img');
            img.src = url;
            img.loading = 'lazy';
            
            div.appendChild(img);
            
            div.addEventListener('click', () => {
                // Restore settings
                promptInput.value = item.prompt;
                styleSelect.value = item.style;
                widthInput.value = item.width;
                heightInput.value = item.height;
                
                // Update UI dimensions
                dimBtns.forEach(b => {
                    if(b.dataset.w === item.width && b.dataset.h === item.height) {
                        b.click();
                    }
                });

                // Show in main area
                setLoading(true);
                const mainImg = new Image();
                mainImg.onload = () => {
                    setLoading(false);
                    imageContainer.innerHTML = '';
                    imageContainer.appendChild(mainImg);
                    actionBar.style.display = 'flex';
                    currentImageUrl = url;
                };
                mainImg.src = url;
            });

            historyGrid.appendChild(div);
        });
    }

    // Toast helper (if not already in utils)
    function showToast(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.textContent = msg;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
        toast.style.color = 'white';
        toast.style.padding = '0.75rem 1.5rem';
        toast.style.borderRadius = '99px';
        toast.style.zIndex = '1000';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
});
