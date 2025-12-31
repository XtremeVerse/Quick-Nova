document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initToolsGrid();
    initSearchAndFilter();
    initStreak();
    recordRecent();
    initPWA();
    initSmartNudge();
    initTypingEffect();
});

// --- Theme Handling ---
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon(true);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcon(false);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme === 'dark');
        });
    }
}

function updateThemeIcon(isDark) {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = isDark ? '☀️' : '🌙';
    }
}

// --- Mobile Menu ---
function initMobileMenu() {
    // Basic toggle for now - could be expanded
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');
    if (btn && nav) {
        btn.addEventListener('click', () => {
            const isFlex = nav.style.display === 'flex';
            nav.style.display = isFlex ? 'none' : 'flex';
            if (!isFlex) {
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '70px';
                nav.style.left = '0';
                nav.style.width = '100%';
                nav.style.background = 'var(--bg-elevated)';
                nav.style.padding = '1rem';
                nav.style.boxShadow = 'var(--shadow-soft)';
            } else {
                nav.style.position = '';
                nav.style.top = '';
                nav.style.width = '';
            }
        });
    }
}

// --- Tools Grid & Filtering ---
function initToolsGrid() {
    const grid = document.getElementById('tools-grid');
    if (!grid || typeof toolsData === 'undefined') return;

    renderTools(toolsData);
}

function renderTools(tools) {
    const grid = document.getElementById('tools-grid');
    if (!grid) return;
    
    const favs = getFavorites();
    grid.innerHTML = tools.map(tool => {
        const isFav = favs.includes(tool.id);
        const favLabel = isFav ? '★' : '☆';
        
        // Generate status badges HTML
        let statusBadgesHtml = '';
        if (tool.badges && tool.badges.length > 0) {
            statusBadgesHtml = tool.badges.map(b => 
                `<span class="status-badge ${b.toLowerCase()}">${b}</span>`
            ).join('');
        }

        return `
        <div class="tool-card fade-in" data-category="${tool.category}" data-id="${tool.id}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <div>
                    <div class="tool-badge">${formatCategory(tool.category)}</div>
                    ${statusBadgesHtml}
                </div>
                <button class="fav-toggle" aria-label="Favorite" style="border:none;background:transparent;font-size:1.2rem;cursor:pointer;color:var(--warning);">${favLabel}</button>
            </div>
            <div class="tool-icon">${tool.icon}</div>
            <h3 class="tool-title">${tool.name}</h3>
            <p class="tool-desc">${tool.desc}</p>
            <div style="display:flex;gap:0.5rem;margin-top:auto;">
                <a href="${tool.link}" class="btn btn-secondary btn-sm" style="flex:1">Open Tool</a>
                <button onclick="toggleFavorite('${tool.id}')" class="btn btn-sm" style="border:1px solid var(--border-subtle);padding:0.5rem;" title="Add to Dashboard">
                    ${isFav ? '★' : '☆'}
                </button>
            </div>
        </div>`;
    }).join('');

    // Re-attach event listeners for fav buttons if needed (or rely on onclick attribute which is simpler here)
    // Note: I switched to onclick in HTML for simplicity in this template literal approach, 
    // but we need to make sure toggleFavorite is global or attached.
    // Actually, let's keep the button class-based listener approach to be cleaner if possible,
    // but the previous code didn't show the listener attachment logic.
    // I'll stick to the previous pattern but add the badges.
    
    // Attach event listeners for fav toggles
    grid.querySelectorAll('.fav-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const card = btn.closest('.tool-card');
            toggleFavorite(card.dataset.id);
            // Re-render to show updated state (or just toggle class)
            // For simplicity, re-rendering the whole grid is easiest but loses animation state.
            // Better: update the button text directly.
            const newFavs = getFavorites();
            const isNowFav = newFavs.includes(card.dataset.id);
            btn.innerHTML = isNowFav ? '★' : '☆';
            
            // Also update the bottom button if present
            const bottomBtn = card.querySelector('button[onclick]');
            if(bottomBtn) bottomBtn.innerHTML = isNowFav ? '★' : '☆';
        });
    });
}

function formatCategory(cat) {
    return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function initSearchAndFilter() {
    const searchInput = document.getElementById('search-tools');
    const filterChips = document.querySelectorAll('.filter-chip');
    
    if (searchInput) {
        // Keyboard shortcut (Ctrl/Cmd + K)
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
                // Visual cue
                searchInput.style.borderColor = 'var(--accent-blue)';
                setTimeout(() => searchInput.style.borderColor = '', 300);
            }
        });

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterTools(query, getActiveCategory());
        });
    }

    if (filterChips) {
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                // Toggle active state
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                
                const category = chip.getAttribute('data-category');
                const query = searchInput ? searchInput.value.toLowerCase() : '';
                filterTools(query, category);
            });
        });
    }
}

function getActiveCategory() {
    const activeChip = document.querySelector('.filter-chip.active');
    return activeChip ? activeChip.getAttribute('data-category') : 'all';
}

function filterTools(query, category) {
    if (typeof toolsData === 'undefined') return;

    let base = toolsData;
    if (category === 'favorites') {
        const favs = getFavorites();
        base = toolsData.filter(t => favs.includes(t.id));
    } else if (category !== 'all') {
        base = toolsData.filter(t => t.category === category);
    }
    const filtered = base.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(query) || tool.desc.toLowerCase().includes(query);
        return matchesSearch;
    });

    renderTools(filtered);
}

function getFavorites() {
    try { return JSON.parse(localStorage.getItem('qn_favorites') || '[]'); } catch(e) { return []; }
}

function toggleFavorite(id) {
    const favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx >= 0) favs.splice(idx, 1); else favs.push(id);
    localStorage.setItem('qn_favorites', JSON.stringify(favs));
}

function recordRecent() {
    if (typeof toolsData === 'undefined') return;
    const path = window.location.pathname;
    const tool = toolsData.find(t => t.link === path);
    if (!tool) return;
    let recent = [];
    try { recent = JSON.parse(localStorage.getItem('qn_recent') || '[]'); } catch(e) { recent = []; }
    recent = [tool.id].concat(recent.filter(id => id !== tool.id)).slice(0, 20);
    localStorage.setItem('qn_recent', JSON.stringify(recent));
}

function initStreak() {
    const today = new Date();
    const keyDate = 'qn_lastVisit';
    const keyStreak = 'qn_streak';
    const last = localStorage.getItem(keyDate);
    const dstr = today.toDateString();
    let streak = parseInt(localStorage.getItem(keyStreak) || '0');
    if (!last) {
        localStorage.setItem(keyDate, dstr);
        localStorage.setItem(keyStreak, '1');
        return;
    }
    if (last === dstr) return;
    const prev = new Date(last);
    const diff = Math.floor((today - prev) / (1000*60*60*24));
    if (diff === 1) streak += 1; else streak = 1;
    localStorage.setItem(keyDate, dstr);
    localStorage.setItem(keyStreak, String(streak));
}

function initPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js');
    }
    const btn = document.getElementById('install-app-btn');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.__pwaPrompt = e;
        if (btn) btn.style.display = 'inline-block';
    });
    if (btn) {
        btn.addEventListener('click', async () => {
            if (!window.__pwaPrompt) return;
            window.__pwaPrompt.prompt();
            await window.__pwaPrompt.userChoice;
            window.__pwaPrompt = null;
            btn.style.display = 'none';
        });
    }
}

function initSmartNudge() {
    // Only on tool pages
    if (!window.location.pathname.includes('/tools/')) return;

    // Check visit count for this specific tool
    const path = window.location.pathname;
    const visitsKey = `qn_visits_${path}`;
    let visits = parseInt(localStorage.getItem(visitsKey) || '0');
    visits++;
    localStorage.setItem(visitsKey, visits);

    // If 2nd or 5th visit, nudge
    if (visits === 2 || visits === 5) {
        // Check if already favorited
        const tool = toolsData.find(t => t.link === path);
        if (tool) {
            const favs = getFavorites();
            if (!favs.includes(tool.id)) {
                setTimeout(() => {
                    showToast('Tip: Add this tool to Dashboard (☆) for quick access!', 'info');
                }, 2000);
            }
        }
    }
}

function initTypingEffect() {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;

    const words = ['Faster', 'Easier', 'Simpler', 'Better'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    // Initial state is the first word fully typed
    charIndex = words[0].length;
    isDeleting = true; // Start by deleting "Faster" after a pause

    function type() {
        const currentWord = words[wordIndex];
        let typeSpeed = 100;
        
        if (isDeleting) {
            textElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            textElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 150;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typeSpeed = 500;
        }

        setTimeout(type, typeSpeed);
    }

    // Start the loop
    setTimeout(type, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.nav-links');
    if (nav && !nav.querySelector('a[href="/tools/ai-chat.html"]')) {
        const link = document.createElement('a');
        link.href = '/tools/ai-chat.html';
        link.textContent = 'AI Chat';
        nav.insertBefore(link, nav.querySelector('a[href="/about.html"]'));
    }
});
