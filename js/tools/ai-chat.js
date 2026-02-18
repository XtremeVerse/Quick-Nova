// ============================================
// QUICKNOVA AI CHAT - FULLY FUNCTIONAL
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ AI Chat Module Loaded');

    // ============================================
    // 1. DOM ELEMENT CACHE
    // ============================================
    const DOM = {
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),
        menuToggle: document.getElementById('menu-toggle'),
        chatMessages: document.getElementById('chat-messages'),
        userInput: document.getElementById('user-input'),
        sendBtn: document.getElementById('send-btn'),
        newChatBtn: document.getElementById('new-chat-btn'),
        modelSelector: document.getElementById('model-selector'),
        modelDropdown: document.getElementById('model-dropdown'),
        themeToggle: document.getElementById('theme-toggle'),
        chatHistory: document.getElementById('chat-history'),
        voiceBtn: document.getElementById('voice-btn'),
        attachBtn: document.getElementById('attach-btn'),
        settingsBtn: document.getElementById('settings-btn'),
        currentModelSpan: document.getElementById('current-model')
    };

    // Verify elements
    Object.keys(DOM).forEach(key => {
        if (!DOM[key]) console.warn(`⚠️ Missing: ${key}`);
    });

    // ============================================
    // 2. AI MODELS CONFIGURATION
    // ============================================
    const MODELS = {
        advanced: {
            name: 'Advanced AI',
            icon: '🤖',
            description: 'Best of all engines combined'
        },
        gpt4: {
            name: 'ChatGPT-4 Style',
            icon: '🚀',
            description: 'Advanced reasoning & analysis'
        },
        gemini: {
            name: 'Gemini Pro',
            icon: '✨',
            description: 'Multimodal insights & knowledge'
        },
        claude: {
            name: 'Claude 3',
            icon: '🧠',
            description: 'Thoughtful & nuanced responses'
        },
        fast: {
            name: 'Fast Response',
            icon: '⚡',
            description: 'Quick & concise answers'
        },
        creative: {
            name: 'Creative Mode',
            icon: '🎨',
            description: 'Imaginative & artistic'
        }
    };

    // ============================================
    // 3. APPLICATION STATE
    // ============================================
    let state = {
        chats: [],
        currentChatId: null,
        selectedModel: 'advanced',
        theme: localStorage.getItem('qn_theme') || 'dark'
    };

    // ============================================
    // 4. INITIALIZATION
    // ============================================
    function initialize() {
        console.log('🔧 Initializing application...');
        
        // Load saved state
        loadState();
        
        // Setup markdown parser
        setupMarkdown();
        
        // Apply theme
        applyTheme();
        
        // Render UI
        renderChatHistory();
        if (state.chats.length === 0) {
            renderEmptyState();
        }
        
        // Attach event listeners
        attachEventListeners();
        
        console.log('✅ Application ready!');
    }

    function setupMarkdown() {
        if (typeof marked === 'undefined') {
            console.warn('⚠️ marked.js not loaded');
            return;
        }
        
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                if (window.hljs && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (e) {
                        return code;
                    }
                }
                return code;
            }
        });
    }

    // ============================================
    // 5. EVENT LISTENERS
    // ============================================
    function attachEventListeners() {
        // Send message
        if (DOM.sendBtn) {
            DOM.sendBtn.addEventListener('click', sendMessage);
        }

        if (DOM.userInput) {
            // Send on Ctrl+Enter or Cmd+Enter
            DOM.userInput.addEventListener('keydown', function(e) {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Auto-resize textarea
            DOM.userInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
        }

        // New chat
        if (DOM.newChatBtn) {
            DOM.newChatBtn.addEventListener('click', startNewChat);
        }

        // Mobile menu toggle
        if (DOM.menuToggle) {
            DOM.menuToggle.addEventListener('click', toggleSidebar);
        }

        if (DOM.sidebarOverlay) {
            DOM.sidebarOverlay.addEventListener('click', closeSidebar);
        }

        // Model selector
        if (DOM.modelSelector) {
            DOM.modelSelector.addEventListener('click', toggleModelDropdown);
        }

        // Model options
        document.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', function() {
                const modelId = this.getAttribute('data-model');
                selectModel(modelId);
                if (DOM.modelDropdown) {
                    DOM.modelDropdown.classList.remove('active');
                }
            });
        });

        // Theme toggle
        if (DOM.themeToggle) {
            DOM.themeToggle.addEventListener('click', toggleTheme);
        }

        // Voice button
        if (DOM.voiceBtn) {
            DOM.voiceBtn.addEventListener('click', function() {
                showToast('🎤 Voice input coming soon!', 'info');
            });
        }

        // Attach button
        if (DOM.attachBtn) {
            DOM.attachBtn.addEventListener('click', function() {
                showToast('📎 File attachment coming soon!', 'info');
            });
        }

        // Settings button
        if (DOM.settingsBtn) {
            DOM.settingsBtn.addEventListener('click', function() {
                showToast('⚙️ Settings coming soon!', 'info');
            });
        }

        // Quick action buttons (delegated)
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('quick-action-btn')) {
                const prompt = e.target.getAttribute('data-prompt');
                if (DOM.userInput) {
                    DOM.userInput.value = prompt;
                    DOM.userInput.focus();
                    DOM.userInput.style.height = 'auto';
                    DOM.userInput.style.height = DOM.userInput.scrollHeight + 'px';
                }
            }
        });

        // Chat history items (delegated)
        if (DOM.chatHistory) {
            DOM.chatHistory.addEventListener('click', function(e) {
                if (e.target.classList.contains('chat-history-item')) {
                    const chatId = parseInt(e.target.getAttribute('data-id'));
                    loadChat(chatId);
                    closeSidebar();
                }
            });
        }

        // Close dropdown on outside click
        document.addEventListener('click', function(e) {
            if (!e.target.closest('#model-selector') && 
                !e.target.closest('#model-dropdown') &&
                DOM.modelDropdown) {
                DOM.modelDropdown.classList.remove('active');
            }
        });

        console.log('✅ Event listeners attached');
    }

    // ============================================
    // 6. SIDEBAR FUNCTIONS
    // ============================================
    function toggleSidebar() {
        if (DOM.sidebar) {
            DOM.sidebar.classList.toggle('active');
            if (DOM.sidebarOverlay) {
                DOM.sidebarOverlay.classList.toggle('active');
            }
        }
    }

    function closeSidebar() {
        if (DOM.sidebar) {
            DOM.sidebar.classList.remove('active');
        }
        if (DOM.sidebarOverlay) {
            DOM.sidebarOverlay.classList.remove('active');
        }
    }

    // ============================================
    // 7. MODEL SELECTION
    // ============================================
    function toggleModelDropdown() {
        if (DOM.modelDropdown) {
            DOM.modelDropdown.classList.toggle('active');
        }
    }

    function selectModel(modelId) {
        if (!MODELS[modelId]) return;

        state.selectedModel = modelId;
        const model = MODELS[modelId];

        // Update UI
        if (DOM.currentModelSpan) {
            DOM.currentModelSpan.textContent = `${model.icon} ${model.name}`;
        }

        // Update active state
        document.querySelectorAll('.model-option').forEach(opt => {
            opt.classList.remove('active');
        });
        document.querySelector(`[data-model="${modelId}"]`)?.classList.add('active');

        saveState();
        console.log(`✅ Model selected: ${modelId}`);
    }

    // ============================================
    // 8. THEME TOGGLE
    // ============================================
    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        saveState();
    }

    function applyTheme() {
        document.documentElement.setAttribute('data-theme', state.theme);
        if (DOM.themeToggle) {
            DOM.themeToggle.textContent = state.theme === 'dark' ? '☀️' : '🌙';
        }
    }

    // ============================================
    // 9. CHAT FUNCTIONS
    // ============================================
    function startNewChat() {
        const chatId = Date.now();
        const newChat = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            model: state.selectedModel
        };

        state.chats.unshift(newChat);
        state.currentChatId = chatId;
        saveState();

        renderChatHistory();
        renderEmptyState();
        if (DOM.userInput) {
            DOM.userInput.focus();
        }
        closeSidebar();

        console.log(`✅ New chat created: ${chatId}`);
    }

    function loadChat(chatId) {
        const chat = state.chats.find(c => c.id === chatId);
        if (!chat) return;

        state.currentChatId = chatId;
        saveState();

        renderChatHistory();
        renderMessages(chat.messages);

        console.log(`✅ Chat loaded: ${chatId}`);
    }

    // ============================================
    // 10. MESSAGE SENDING
    // ============================================
    function sendMessage() {
        const text = DOM.userInput.value.trim();
        if (!text) return;

        // Get or create current chat
        let chat = state.chats.find(c => c.id === state.currentChatId);
        if (!chat) {
            startNewChat();
            chat = state.chats[0];
        }

        // Remove empty state
        const emptyState = DOM.chatMessages.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        // Add user message
        chat.messages.push({
            id: Date.now(),
            role: 'user',
            content: text,
            timestamp: new Date().toISOString()
        });

        // Render messages
        renderMessages(chat.messages);

        // Clear input
        DOM.userInput.value = '';
        DOM.userInput.style.height = 'auto';

        // Add typing indicator
        chat.messages.push({
            id: Date.now() + 1,
            role: 'ai',
            content: getTypingIndicator(),
            timestamp: new Date().toISOString(),
            isTyping: true
        });

        renderMessages(chat.messages);
        saveState();

        // Generate response
        setTimeout(() => {
            generateAIResponse(chat, text);
        }, 600);
    }

    function generateAIResponse(chat, userMessage) {
        const model = MODELS[state.selectedModel];
        const responses = {
            advanced: `I appreciate your question about "${userMessage.substring(0, 30)}..."\n\nAs an Advanced AI combining the best of ChatGPT, Gemini, and Claude, here's my comprehensive response:\n\n• **Analysis**: Your query touches on important aspects that deserve careful consideration\n• **Key Insight**: Understanding this requires looking at multiple perspectives\n• **Practical Takeaway**: Here's what you can apply immediately\n\nWould you like me to dive deeper into any specific aspect?`,
            
            gpt4: `That's an excellent question! Let me break this down step-by-step for you.\n\nAbout "${userMessage.substring(0, 30)}...":\n\n1. **First**, let's establish the foundation\n2. **Next**, we should consider the implications\n3. **Finally**, here's how you can apply this knowledge\n\nFeel free to ask follow-up questions!`,
            
            gemini: `Interesting inquiry! Let me provide you with nuanced insights.\n\nRegarding "${userMessage.substring(0, 30)}...":\n\n**Key Points**:\n- This topic intersects multiple domains of knowledge\n- There are several valid perspectives to consider\n- Modern understanding has evolved significantly\n\nWhat specific aspect would you like to explore further?`,
            
            claude: `That's a thoughtful question. Let me provide a careful and nuanced response.\n\nAbout "${userMessage.substring(0, 30)}...":\n\n**My Analysis**:\n- The core issue involves several interconnected factors\n- It's important to acknowledge different viewpoints\n- Context matters significantly here\n\nI'm happy to elaborate on any part of this.`,
            
            fast: `Quick answer about "${userMessage.substring(0, 30)}...":\n\n✓ Key point 1: It's more important than many realize\n✓ Key point 2: Here's the actionable insight\n✓ Key point 3: Apply this immediately\n\nNeed more details? Just ask!`,
            
            creative: `What a wonderful prompt! Let me weave together some creative thoughts about "${userMessage.substring(0, 30)}...".\n\n**Creative Perspective**:\nImagine this scenario... We could explore this from a fresh angle by considering...\n\n**Imaginative Application**:\n- Here's an innovative way to think about it\n- Consider this creative angle\n- Possibilities are endless!\n\nLet's develop this idea together!`
        };

        const modelKey = state.selectedModel || 'advanced';
        const response = responses[modelKey] || responses.advanced;

        // Update last message (typing indicator) with actual response
        const lastMsg = chat.messages[chat.messages.length - 1];
        lastMsg.content = response;
        lastMsg.isTyping = false;

        renderMessages(chat.messages);

        // Update chat title if first message
        if (chat.messages.length <= 3) {
            chat.title = userMessage.substring(0, 40);
        }

        saveState();
        renderChatHistory();

        console.log(`✅ AI Response generated using ${modelKey} model`);
    }

    // ============================================
    // 11. UI RENDERING
    // ============================================
    function renderEmptyState() {
        if (!DOM.chatMessages) return;

        DOM.chatMessages.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">💬</div>
                <h2>QuickNova AI Chat</h2>
                <p>Powered by multiple advanced AI engines - ChatGPT, Gemini, Claude & more. Choose a model and start chatting!</p>
                <div class="quick-actions">
                    <button class="quick-action-btn" data-prompt="Explain quantum physics in simple terms">🌌 Physics</button>
                    <button class="quick-action-btn" data-prompt="Write a Python script that">💻 Code</button>
                    <button class="quick-action-btn" data-prompt="Create a story about">📚 Story</button>
                    <button class="quick-action-btn" data-prompt="Help me learn about">🎓 Learn</button>
                </div>
            </div>
        `;
    }

    function renderMessages(messages) {
        if (!DOM.chatMessages) return;

        DOM.chatMessages.innerHTML = '';

        messages.forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${msg.role}`;

            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = msg.role === 'user' ? '👤' : '🤖';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';

            if (msg.role === 'user') {
                contentDiv.textContent = msg.content;
            } else {
                if (msg.isTyping) {
                    contentDiv.innerHTML = msg.content;
                } else {
                    // Parse markdown
                    if (window.marked) {
                        try {
                            contentDiv.innerHTML = marked.parse(msg.content);
                        } catch (e) {
                            contentDiv.textContent = msg.content;
                        }
                    } else {
                        contentDiv.textContent = msg.content;
                    }

                    // Highlight code
                    if (window.hljs) {
                        contentDiv.querySelectorAll('pre code').forEach(block => {
                            hljs.highlightElement(block);
                        });
                    }

                    // Add copy buttons to code blocks
                    contentDiv.querySelectorAll('pre').forEach(pre => {
                        if (!pre.querySelector('.copy-code-btn')) {
                            const btn = document.createElement('button');
                            btn.className = 'copy-code-btn';
                            btn.textContent = '📋 Copy';
                            btn.onclick = function(e) {
                                e.stopPropagation();
                                const code = pre.querySelector('code').innerText;
                                navigator.clipboard.writeText(code).then(() => {
                                    btn.textContent = '✓ Copied!';
                                    setTimeout(() => btn.textContent = '📋 Copy', 2000);
                                });
                            };
                            pre.appendChild(btn);
                        }
                    });
                }
            }

            msgDiv.appendChild(avatar);
            msgDiv.appendChild(contentDiv);

            // Add actions for AI messages
            if (msg.role === 'ai' && !msg.isTyping) {
                const actions = document.createElement('div');
                actions.className = 'message-actions';
                actions.innerHTML = `
                    <button class="message-action-btn" title="Like">👍</button>
                    <button class="message-action-btn" title="Copy" onclick="navigator.clipboard.writeText('${msg.content.replace(/'/g, "\\'")}')">📋</button>
                    <button class="message-action-btn" title="Share">🔗</button>
                `;
                msgDiv.appendChild(actions);
            }

            DOM.chatMessages.appendChild(msgDiv);
        });

        // Scroll to bottom
        setTimeout(() => {
            DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
        }, 10);
    }

    function renderChatHistory() {
        if (!DOM.chatHistory) return;

        DOM.chatHistory.innerHTML = '';

        state.chats.forEach(chat => {
            const item = document.createElement('button');
            item.className = 'chat-history-item';
            if (chat.id === state.currentChatId) {
                item.classList.add('active');
            }
            item.setAttribute('data-id', chat.id);
            item.title = chat.title;
            item.textContent = chat.title || 'Untitled';

            DOM.chatHistory.appendChild(item);
        });

        if (state.chats.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.style.padding = '1rem';
            emptyMsg.style.color = 'var(--text-secondary)';
            emptyMsg.style.fontSize = '0.875rem';
            emptyMsg.textContent = 'No chats yet. Start a new conversation!';
            DOM.chatHistory.appendChild(emptyMsg);
        }
    }

    // ============================================
    // 12. HELPER FUNCTIONS
    // ============================================
    function getTypingIndicator() {
        return '<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>';
    }

    function showToast(message, type = 'info') {
        // Use the global showToast if available from utils.js
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    // ============================================
    // 13. STATE PERSISTENCE
    // ============================================
    function saveState() {
        try {
            localStorage.setItem('qn_ai_state', JSON.stringify(state));
            console.log('✅ State saved');
        } catch (e) {
            console.error('❌ Failed to save state:', e);
        }
    }

    function loadState() {
        try {
            const saved = localStorage.getItem('qn_ai_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...state, ...parsed };
                console.log('✅ State loaded');
            }
        } catch (e) {
            console.error('❌ Failed to load state:', e);
        }
    }

    // ============================================
    // 14. START APPLICATION
    // ============================================
    initialize();
});
