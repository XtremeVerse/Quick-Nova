document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const personaSelect = document.getElementById('persona-select');
    const modelSelect = document.getElementById('model-select');
    const sidebar = document.querySelector('.chat-sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeSidebarBtn = document.getElementById('toggle-sidebar-mobile');
    const personaChips = document.querySelectorAll('[data-persona-chip]');
    const modelQuick = document.getElementById('model-quick');
    const newChatQuick = document.getElementById('new-chat-quick');
    const clearQuick = document.getElementById('clear-history-quick');

    // --- Configuration ---
    const SYSTEM_PROMPTS = {
        default: "You are QuickNova AI, a helpful, friendly, and intelligent assistant. You provide clear, concise, and accurate answers.",
        coder: "You are an expert Senior Software Engineer. You write clean, efficient, and well-documented code. You explain complex technical concepts simply. Always provide code examples in markdown code blocks.",
        writer: "You are a creative writing assistant. You help with brainstorming, drafting, and editing. Your tone is engaging and imaginative.",
        teacher: "You are a patient and knowledgeable tutor. You explain concepts step-by-step, use analogies, and encourage learning. You don't just give answers, you help the user understand.",
        analyst: "You are a data analyst. You are precise, analytical, and objective. You help interpret data, find patterns, and provide logical insights."
    };

    // --- State Management ---
    let state = {
        history: [],
        persona: 'default',
        model: 'openai'
    };

    // --- Initialization ---
    init();

    function init() {
        loadState();
        setupMarkdown();
        setupEventListeners();
        renderHistory();
        
        // Mobile sidebar check
        checkMobileLayout();
        window.addEventListener('resize', checkMobileLayout);
    }

    function setupMarkdown() {
        // Configure marked.js
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            userInput.focus();
        }
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            if (sidebar.style.display === 'none' || !sidebar.classList.contains('active')) {
                sidebar.classList.add('active');
                sidebar.style.display = 'flex';
            } else {
                sidebar.classList.remove('active');
                sidebar.style.display = 'none';
            }
        }
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            startNewChat();
        }
    });

    function loadState() {
        const savedState = localStorage.getItem('quicknova_ai_state');
        if (savedState) {
            state = JSON.parse(savedState);
            // Restore settings in UI
            if (state.persona) personaSelect.value = state.persona;
            if (state.model) modelSelect.value = state.model;
        }
    }

    function saveState() {
        localStorage.setItem('quicknova_ai_state', JSON.stringify(state));
    }

    // --- UI Rendering ---
    function renderHistory() {
        chatMessages.innerHTML = '';
        
        // Always show welcome message if history is empty
        if (state.history.length === 0) {
            addMessageToUI('ai', "Hello! I'm QuickNova AI. How can I help you today?");
            return;
        }

        state.history.forEach(msg => {
            // Skip system messages in UI
            if (msg.role === 'system') return;
            addMessageToUI(msg.role === 'user' ? 'user' : 'ai', msg.content);
        });
        
        scrollToBottom();
    }

    function addMessageToUI(role, content, isTyping = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role}`;
        if (isTyping) msgDiv.id = 'typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = role === 'user' ? '👤' : '🤖';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (role === 'ai' && !isTyping) {
            contentDiv.innerHTML = marked.parse(content);
            // Add copy buttons to code blocks
            addCopyButtons(contentDiv);
        } else {
            contentDiv.textContent = content; // User messages are plain text to prevent XSS
            if (isTyping) contentDiv.innerHTML = '<em>Thinking...</em>';
        }

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(contentDiv);
        chatMessages.appendChild(msgDiv);

        scrollToBottom();
    }

    function addCopyButtons(element) {
        const preTags = element.querySelectorAll('pre');
        preTags.forEach(pre => {
            if (pre.querySelector('.copy-btn')) return; // Already has button

            const btn = document.createElement('button');
            btn.className = 'copy-btn';
            btn.textContent = 'Copy';
            btn.addEventListener('click', () => {
                const code = pre.querySelector('code').innerText;
                navigator.clipboard.writeText(code);
                btn.textContent = 'Copied!';
                setTimeout(() => btn.textContent = 'Copy', 2000);
            });
            pre.appendChild(btn);
        });
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function checkMobileLayout() {
        if (window.innerWidth <= 768) {
            mobileMenuBtn.style.display = 'block';
            closeSidebarBtn.style.display = 'block';
        } else {
            mobileMenuBtn.style.display = 'none';
            closeSidebarBtn.style.display = 'none';
            sidebar.classList.remove('active');
            sidebar.style.display = 'flex';
        }
    }

    // --- Logic ---
    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        // UI Update
        addMessageToUI('user', text);
        userInput.value = '';
        userInput.style.height = '60px'; // Reset height
        
        // Add typing indicator
        addMessageToUI('ai', '...', true);

        // Update History
        state.history.push({ role: 'user', content: text });
        saveState();

        try {
            // Basic response for demo
            await new Promise(resolve => setTimeout(resolve, 500)); // Short delay
            
            const userMessage = text.toLowerCase();
            let response = "I understand you said: '" + text + "'. How can I help you with that?";
            
            // Simple keyword responses
            if (userMessage.includes('hello') || userMessage.includes('hi')) {
                response = "Hello! Nice to meet you. What can I help you with today?";
            } else if (userMessage.includes('how are you')) {
                response = "I'm doing well, thank you for asking! I'm here to help you.";
            } else if (userMessage.includes('bye') || userMessage.includes('goodbye')) {
                response = "Goodbye! Have a great day!";
            } else if (userMessage.includes('code') || userMessage.includes('programming')) {
                response = "I'd be happy to help with coding! What programming language are you working with?";
            } else if (userMessage.includes('thank')) {
                response = "You're welcome! Is there anything else I can assist you with?";
            }

            // Remove typing indicator
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) typingIndicator.remove();

            // Add AI response
            addMessageToUI('ai', response);
            
            // Save to history
            state.history.push({ role: 'assistant', content: response });
            saveState();

        } catch (error) {
            console.error(error);
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) typingIndicator.remove();
            addMessageToUI('ai', 'Sorry, something went wrong. Please try again.');
        }
    }

    function startNewChat() {
        if (confirm('Start a new chat? This will clear the current conversation from view (but settings are saved).')) {
            state.history = [];
            saveState();
            renderHistory();
            if (window.innerWidth <= 768) sidebar.classList.remove('active');
        }
    }

    function clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            state.history = [];
            saveState();
            renderHistory();
        }
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        sendBtn.addEventListener('click', handleSend);
        
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        // Auto-resize textarea
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if (this.value === '') this.style.height = '60px';
        });

        newChatBtn.addEventListener('click', startNewChat);
        clearHistoryBtn.addEventListener('click', clearHistory);

        personaSelect.addEventListener('change', (e) => {
            state.persona = e.target.value;
            saveState();
            // Optional: Add a system message indicating mode switch
            // addMessageToUI('system', `Switched to ${e.target.options[e.target.selectedIndex].text} mode.`);
        });

        modelSelect.addEventListener('change', (e) => {
            state.model = e.target.value;
            saveState();
        });

        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebar.style.display = 'flex';
        });

        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebar.style.display = 'none';
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                e.target !== mobileMenuBtn) {
                sidebar.classList.remove('active');
                sidebar.style.display = 'none';
            }
        });

        personaChips.forEach(chip => {
            chip.addEventListener('click', () => {
                personaChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                state.persona = chip.getAttribute('data-persona-chip');
                personaSelect.value = state.persona;
                saveState();
            });
        });
        // Set initial active persona chip
        personaChips.forEach(c => {
            if (c.getAttribute('data-persona-chip') === state.persona) {
                c.classList.add('active');
            }
        });
        if (modelQuick) {
            modelQuick.value = state.model;
            modelQuick.addEventListener('change', (e) => {
                state.model = e.target.value;
                modelSelect.value = state.model;
                saveState();
            });
        }
        if (newChatQuick) newChatQuick.addEventListener('click', startNewChat);
        if (clearQuick) clearQuick.addEventListener('click', clearHistory);

        const quickChips = document.querySelectorAll('#quick-bar [data-prompt]');
        quickChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const p = chip.getAttribute('data-prompt') || '';
                userInput.focus();
                const current = userInput.value;
                if (!current) {
                    userInput.value = p;
                } else {
                    userInput.value = current + '\n' + p;
                }
                const event = new Event('input');
                userInput.dispatchEvent(event);
            });
        });

        sendBtn.disabled = true;
        function refreshSend() {
            const hasText = userInput.value.trim().length > 0;
            sendBtn.disabled = !hasText;
            sendBtn.style.opacity = hasText ? '1' : '0.6';
        }
        refreshSend();
        userInput.addEventListener('input', refreshSend);
        userInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSend();
            }
        });
    }
});
