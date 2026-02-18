document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const menuToggle = document.getElementById('menu-toggle');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const modelSelector = document.getElementById('model-selector');
    const modelDropdown = document.getElementById('model-dropdown');
    const themeToggle = document.getElementById('theme-toggle');
    const chatHistory = document.getElementById('chat-history');
    const voiceBtn = document.getElementById('voice-btn');
    const attachBtn = document.getElementById('attach-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const currentModelSpan = document.getElementById('current-model');

    // --- AI Models Configuration ---
    const MODELS = {
        advanced: {
            name: 'Advanced AI',
            icon: '🤖',
            systemPrompt: 'You are QuickNova Advanced AI, a sophisticated assistant combining the best of ChatGPT, Gemini, Claude and other leading AI models. You are exceptionally intelligent, creative, and helpful. You provide accurate, detailed, and thoughtful responses on any topic. You understand context, nuance, and can adapt your communication style to the user.'
        },
        gpt4: {
            name: 'ChatGPT-4 Style',
            icon: '🚀',
            systemPrompt: 'You are ChatGPT-4, known for being exceptionally helpful, creative, and capable. You excel at complex reasoning, writing, coding, analysis, and creative tasks. You think step-by-step and provide comprehensive answers.'
        },
        gemini: {
            name: 'Gemini Pro',
            icon: '✨',
            systemPrompt: 'You are Google Gemini Pro, known for multimodal understanding and advanced reasoning. You provide insightful, nuanced responses with deep knowledge across domains. You are excellent at analysis, coding, and creative work.'
        },
        claude: {
            name: 'Claude 3',
            icon: '🧠',
            systemPrompt: 'You are Anthropic Claude 3, known for thoughtful, nuanced, and careful reasoning. You provide detailed explanations, excellent at analysis, writing, and coding. You are helpful, harmless, and honest.'
        },
        fast: {
            name: 'Fast Response',
            icon: '⚡',
            systemPrompt: 'You are a fast, responsive AI assistant. Provide quick, concise, and direct answers. Focus on efficiency and clarity. Keep responses brief but informative.'
        },
        creative: {
            name: 'Creative Mode',
            icon: '🎨',
            systemPrompt: 'You are a creative AI that excels at imaginative tasks. You help with writing stories, poetry, creative ideas, brainstorming, and artistic projects. You are expressive, imaginative, and inspiring.'
        }
    };

    // --- State Management ---
    let state = {
        chats: [],
        currentChatId: null,
        selectedModel: 'advanced',
        theme: localStorage.getItem('theme') || 'dark'
    };

    // --- Initialize ---
    init();

    function init() {
        loadState();
        setupMarkdown();
        setupEventListeners();
        applyTheme();
        renderEmptyState();
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
        // Message sending
        sendBtn.addEventListener('click', handleSend);
        userInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSend();
            }
        });

        // Mobile menu
        menuToggle.addEventListener('click', toggleSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);
        newChatBtn.addEventListener('click', startNewChat);

        // Model selection
        modelSelector.addEventListener('click', () => {
            modelDropdown.classList.toggle('active');
        });

        document.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', () => {
                const model = option.dataset.model;
                selectModel(model);
                modelDropdown.classList.remove('active');
            });
        });

        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);

        // Settings button
        settingsBtn.addEventListener('click', () => {
            showToast('Settings coming soon!', 'info');
        });

        // Quick actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-action-btn')) {
                userInput.value = e.target.dataset.prompt;
                userInput.focus();
            }
        });

        // Voice button
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                showToast('Voice input coming soon!', 'info');
            });
        }

        // Attach button
        if (attachBtn) {
            attachBtn.addEventListener('click', () => {
                showToast('File attachment coming soon!', 'info');
            });
        }

        // Auto-resize textarea
        userInput.addEventListener('input', () => {
            userInput.style.height = 'auto';
            userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
        });

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#model-selector') && !e.target.closest('#model-dropdown')) {
                modelDropdown.classList.remove('active');
            }
        });

        // Close sidebar on item click on mobile
        chatHistory.addEventListener('click', (e) => {
            if (e.target.classList.contains('chat-history-item')) {
                if (window.innerWidth <= 900) {
                    closeSidebar();
                }
            }
        });
    }

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }

    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        localStorage.setItem('theme', state.theme);
        saveState();
    }

    function applyTheme() {
        document.documentElement.setAttribute('data-theme', state.theme);
        themeToggle.textContent = state.theme === 'dark' ? '☀️' : '🌙';
    }

    function selectModel(modelId) {
        state.selectedModel = modelId;
        const model = MODELS[modelId];
        currentModelSpan.textContent = `${model.icon} ${model.name}`;
        
        document.querySelectorAll('.model-option').forEach(opt => {
            opt.classList.remove('active');
        });
        document.querySelector(`[data-model="${modelId}"]`).classList.add('active');
        
        saveState();
    }

    function renderEmptyState() {
        chatMessages.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <h2>QuickNova AI Chat</h2>
                <p>Powered by multiple advanced AI engines including ChatGPT-style, Gemini, Claude & more combined in one beautiful interface.</p>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-prompt="Explain quantum physics">🌌 Physics</button>
                    <button class="quick-action-btn" data-prompt="Write a Python script">💻 Code</button>
                    <button class="quick-action-btn" data-prompt="Create a story about">📚 Story</button>
                    <button class="quick-action-btn" data-prompt="Help me learn">🎓 Learn</button>
                </div>
            </div>
        `;
    }

    function startNewChat() {
        const chatId = Date.now();
        const newChat = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
        };
        state.chats.unshift(newChat);
        state.currentChatId = chatId;
        saveState();
        renderChatHistory();
        renderEmptyState();
        userInput.focus();
        closeSidebar();
    }

    function renderChatHistory() {
        chatHistory.innerHTML = '';
        state.chats.forEach(chat => {
            const item = document.createElement('button');
            item.className = 'chat-history-item';
            if (chat.id === state.currentChatId) {
                item.classList.add('active');
            }
            item.textContent = chat.title || 'Untitled chat';
            item.addEventListener('click', () => {
                loadChat(chat.id);
            });
            chatHistory.appendChild(item);
        });
    }

    function loadChat(chatId) {
        state.currentChatId = chatId;
        const chat = state.chats.find(c => c.id === chatId);
        if (chat) {
            renderChatHistory();
            renderMessages(chat.messages);
        }
    }

    // --- Chat Logic ---
    async function handleSend() {
        const text = userInput.value.trim();
        if (!text) return;

        // Get or create current chat
        let currentChat = state.chats.find(c => c.id === state.currentChatId);
        if (!currentChat) {
            startNewChat();
            currentChat = state.chats[0];
        }

        // Remove empty state
        const emptyState = chatMessages.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        // Add user message
        addMessageToChat(currentChat, 'user', text);
        renderMessages(currentChat.messages);
        userInput.value = '';
        userInput.style.height = 'auto';

        // Add AI response with typing indicator
        addMessageToChat(currentChat, 'ai', getTypingIndicator(), true);
        renderMessages(currentChat.messages);

        try {
            // Simulate API response with model-specific behavior
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

            // Remove typing indicator
            currentChat.messages[currentChat.messages.length - 1].content = generateResponse(text);
            
            // Update chat title if first message
            if (currentChat.messages.length === 2) {
                currentChat.title = text.substring(0, 40);
            }

            renderMessages(currentChat.messages);
            renderChatHistory();
            saveState();
        } catch (error) {
            console.error('Error:', error);
            showToast('An error occurred', 'error');
        }

        scrollToBottom();
    }

    function generateResponse(userMessage) {
        const model = MODELS[state.selectedModel];
        
        // Model-specific response styles
        const responses = {
            advanced: [
                'That\'s an excellent question. Let me provide a comprehensive response based on the latest information and best practices.',
                'I appreciate your inquiry. Here\'s my detailed analysis of that topic.',
                'Great point! Based on current knowledge and best practices, here\'s what I can tell you.'
            ],
            gpt4: [
                'That\'s an interesting question. Let me break this down step by step for you.',
                'I\'ll analyze this carefully and provide you with a thorough response.',
                'Excellent question! Here\'s a comprehensive breakdown.'
            ],
            gemini: [
                'That\'s a fascinating inquiry. Let me provide you with nuanced insights.',
                'I can see multiple angles to this. Here\'s my analysis.',
                'Great question! This requires some thoughtful consideration.'
            ],
            claude: [
                'That\'s a thoughtful question. Let me provide a careful and nuanced response.',
                'I appreciate you asking that. Here\'s my considered perspective.',
                'That\'s an interesting point. Allow me to think through this thoroughly.'
            ],
            fast: [
                'Quick answer: Based on your question about "' + userMessage.substring(0, 20) + '", here\'s what you need to know.',
                'Straight to the point: ' + userMessage.substring(0, 20) + ' is interesting. Here\'s the key info.',
                'Simply put: You asked about ' + userMessage.substring(0, 20) + '. Here\'s the essentials.'
            ],
            creative: [
                'What a creative prompt! Let me weave a response around your idea about "' + userMessage.substring(0, 30) + '".',
                'I love the creative energy here! Let me expand on your thought about ' + userMessage.substring(0, 20) + '.',
                'What an imaginative question! Here\'s my creative take on ' + userMessage.substring(0, 20) + '.'
            ]
        };

        const modelResponses = responses[state.selectedModel] || responses.advanced;
        const baseResponse = modelResponses[Math.floor(Math.random() * modelResponses.length)];

        return `${baseResponse}\n\nAbout "${userMessage}":\n\nThis is a great topic within the scope of QuickNova AI. Here are some insights:\n\n• **Key Point 1**: The subject you mentioned relates to important developments in ${state.selectedModel === 'creative' ? 'creative thinking' : 'current knowledge'}\n• **Key Point 2**: There are multiple perspectives to consider on this matter\n• **Key Point 3**: Understanding this fully requires context and nuanced thinking\n\nI'm powered by the ${MODELS[state.selectedModel].name} engine, combining the best AI capabilities. Feel free to ask follow-up questions or explore related topics!`;
    }

    function addMessageToChat(chat, role, content, isHTML = false) {
        chat.messages.push({
            role,
            content,
            isHTML,
            timestamp: new Date().toISOString()
        });
    }

    function renderMessages(messages) {
        chatMessages.innerHTML = '';
        messages.forEach((msg, idx) => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.role}`;

            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = msg.role === 'user' ? '👤' : '🤖';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';

            if (msg.role === 'user') {
                contentDiv.textContent = msg.content;
            } else {
                // Parse markdown for AI messages
                if (msg.content.includes('<div class="typing-indicator">')) {
                    contentDiv.innerHTML = msg.content;
                } else {
                    const parsed = marked.parse(msg.content);
                    contentDiv.innerHTML = parsed;
                    
                    // Highlight code
                    contentDiv.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightElement(block);
                    });

                    // Add copy buttons to code blocks
                    contentDiv.querySelectorAll('pre').forEach(pre => {
                        if (!pre.querySelector('.copy-code-btn')) {
                            const copyBtn = document.createElement('button');
                            copyBtn.className = 'copy-code-btn';
                            copyBtn.textContent = '📋 Copy';
                            copyBtn.addEventListener('click', (e) => {
                                const code = pre.querySelector('code').innerText;
                                navigator.clipboard.writeText(code).then(() => {
                                    copyBtn.textContent = '✓ Copied!';
                                    setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
                                });
                            });
                            pre.appendChild(copyBtn);
                        }
                    });
                }
            }

            messageDiv.appendChild(avatar);
            messageDiv.appendChild(contentDiv);

            // Add message actions for AI messages
            if (msg.role === 'ai' && !msg.content.includes('typing')) {
                const actions = document.createElement('div');
                actions.className = 'message-actions';
                actions.innerHTML = `
                    <button class="message-action-btn" title="Thumbs up">👍</button>
                    <button class="message-action-btn" title="Thumbs down">👎</button>
                    <button class="message-action-btn" title="Copy" onclick="navigator.clipboard.writeText('${msg.content.replace(/'/g, "\\'")}')">📋</button>
                    <button class="message-action-btn" title="Share">🔗</button>
                `;
                messageDiv.appendChild(actions);
            }

            chatMessages.appendChild(messageDiv);
        });

        scrollToBottom();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function getTypingIndicator() {
        return '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    }

    // --- State Management ---
    function loadState() {
        try {
            const saved = localStorage.getItem('qn_ai_chat_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
            }
        } catch (e) {
            console.error('Failed to load state:', e);
        }
        
        if (state.chats.length === 0) {
            state.currentChatId = null;
        }
    }

    function saveState() {
        try {
            localStorage.setItem('qn_ai_chat_state', JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    // Initial setup
    selectModel(state.selectedModel);
    renderChatHistory();
});
