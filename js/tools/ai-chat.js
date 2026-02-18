document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatSidebar = document.getElementById('chat-sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const modeSelector = document.getElementById('mode-selector');
    const quickActions = document.querySelectorAll('.quick-action-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const optionsBtn = document.getElementById('options-btn');

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
        currentPersona: 'default',
        chatHistoryList: []
    };

    // --- Initialize ---
    init();

    function init() {
        loadState();
        setupMarkdown();
        setupEventListeners();
        setupMobileMenu();
        setupAutoResize();
        renderInitialState();
    }

    function setupMarkdown() {
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

    function setupEventListeners() {
        sendBtn.addEventListener('click', handleSend);
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });

        newChatBtn.addEventListener('click', startNewChat);
        
        // Mode selection
        modeSelector.querySelectorAll('.mode-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                modeSelector.querySelectorAll('.mode-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                state.currentPersona = chip.dataset.persona;
                saveState();
            });
        });

        // Quick actions
        quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                userInput.value = btn.dataset.prompt;
                userInput.focus();
            });
        });

        // Voice button
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                showToast('Voice input coming soon!', 'info');
            });
        }

        // Options button
        if (optionsBtn) {
            optionsBtn.addEventListener('click', () => {
                showToast('More options coming soon!', 'info');
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                userInput.focus();
            }
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                chatSidebar.classList.toggle('active');
            }
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                startNewChat();
            }
        });
    }

    function setupMobileMenu() {
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                chatSidebar.classList.toggle('active');
                sidebarOverlay.classList.toggle('active');
            });
        }

        if (closeSidebarBtn) {
            closeSidebarBtn.addEventListener('click', () => {
                chatSidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                chatSidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });
        }

        // Close sidebar on mobile when new chat is clicked
        newChatBtn.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                chatSidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
        });
    }

    function setupAutoResize() {
        userInput.addEventListener('input', () => {
            userInput.style.height = 'auto';
            userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
        });
    }

    function renderInitialState() {
        if (state.history.length === 0) {
            chatMessages.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🤖</div>
                    <h2>Welcome to QuickNova AI</h2>
                    <p>Start a conversation or select a mode to get personalized assistance</p>
                    <div class="quick-actions">
                        <button class="quick-action-btn" data-prompt="Summarize: ">📝 Summarize</button>
                        <button class="quick-action-btn" data-prompt="Explain: ">💡 Explain</button>
                        <button class="quick-action-btn" data-prompt="Fix grammar: ">✓ Fix</button>
                        <button class="quick-action-btn" data-prompt="Translate: ">🌐 Translate</button>
                    </div>
                </div>
            `;
            attachQuickActionListeners();
        } else {
            renderHistory();
        }
    }

    function renderHistory() {
        chatMessages.innerHTML = '';
        state.history.forEach(msg => {
            if (msg.role === 'user') {
                addMessageToUI('user', msg.content);
            } else if (msg.role === 'ai') {
                addMessageToUI('ai', msg.content);
            }
        });
        scrollToBottom();
    }

    function attachQuickActionListeners() {
        chatMessages.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                userInput.value = btn.dataset.prompt;
                userInput.focus();
            });
        });
    }

    // --- Logic ---
    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        // Remove empty state
        const emptyState = chatMessages.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        // Add user message
        addMessageToUI('user', text);
        userInput.value = '';
        userInput.style.height = 'auto';

        // Add typing indicator
        addMessageToUI('ai', getTypingIndicator(), true);

        // Update history
        state.history.push({ role: 'user', content: text });
        saveState();

        try {
            // Simulate API response
            await new Promise(resolve => setTimeout(resolve, 800));

            // Remove typing indicator
            const lastMessage = chatMessages.lastElementChild;
            if (lastMessage && lastMessage.querySelector('.typing-indicator')) {
                lastMessage.remove();
            }

            // Generate response
            let response = generateResponse(text);
            addMessageToUI('ai', response);

            state.history.push({ role: 'ai', content: response });
            saveState();
        } catch (error) {
            console.error('Error:', error);
            showToast('An error occurred', 'error');
        }

        scrollToBottom();
    }

    function generateResponse(userMessage) {
        const messages = [
            "That's a great question! Let me help you with that.",
            "I understand what you're asking. Here's what I can tell you:",
            "Based on what you've shared, here's my response:",
            "Thanks for asking! Here's my perspective:",
            "I appreciate the question. Here's my analysis:"
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        return `${randomMessage}\n\nYou asked about: "${userMessage}"\n\nI'm QuickNova AI, and I'm here to help you with coding, writing, analysis, and more. Feel free to ask me anything!`;
    }

    function getTypingIndicator() {
        return '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    }

    function addMessageToUI(role, content, isHTML = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? '👤' : '🤖';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (isHTML) {
            contentDiv.innerHTML = content;
        } else {
            contentDiv.textContent = content;
            // Parse markdown if it's AI response
            if (role === 'ai') {
                const parsed = marked.parse(content);
                contentDiv.innerHTML = parsed;
                // Highlight code blocks
                contentDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        scrollToBottom();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function startNewChat() {
        state.history = [];
        state.chatHistoryList.push({
            id: Date.now(),
            title: 'New Chat',
            messages: []
        });
        saveState();

        chatMessages.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🤖</div>
                <h2>Welcome to QuickNova AI</h2>
                <p>Start a conversation or select a mode to get personalized assistance</p>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-prompt="Summarize: ">📝 Summarize</button>
                    <button class="quick-action-btn" data-prompt="Explain: ">💡 Explain</button>
                    <button class="quick-action-btn" data-prompt="Fix grammar: ">✓ Fix</button>
                    <button class="quick-action-btn" data-prompt="Translate: ">🌐 Translate</button>
                </div>
            </div>
        `;

        attachQuickActionListeners();
        userInput.focus();
    }

    // --- State Management ---
    function loadState() {
        try {
            const saved = localStorage.getItem('qn_ai_chat_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
                // Set active persona chip
                const activeChip = modeSelector.querySelector(`[data-persona="${state.currentPersona}"]`);
                if (activeChip) {
                    modeSelector.querySelectorAll('.mode-chip').forEach(c => c.classList.remove('active'));
                    activeChip.classList.add('active');
                }
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }

    function saveState() {
        try {
            localStorage.setItem('qn_ai_chat_state', JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }
});
