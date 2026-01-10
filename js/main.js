document.addEventListener('DOMContentLoaded', () => {
    initAnalytics();
    initAds();
    initTheme();
    initMobileMenu();
    initToolsGrid();
    initSearchAndFilter();
    initStreak();
    recordRecent();
    initPWA();
    initSmartNudge();
    initTypingEffect();
    initShareUI();
    initToolSchema();
    initTrending();
    initInvite();
    initHomeShareNudge();
});

function initAnalytics() {
    if (window.gtag) return;
    const s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-88T5VL450S';
    s.async = true;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', 'G-88T5VL450S');
}

function initAds() {
    // Ensure an in-tool ad slot exists on tool pages
    if (window.location.pathname.includes('/tools/')) {
        const contentSlot = document.querySelector('.ad-slot.ad-content');
        if (!contentSlot) {
            const workspace = document.querySelector('.tool-workspace');
            const container = workspace || document.querySelector('.tool-container');
            if (container) {
                const ad = document.createElement('div');
                ad.className = 'ad-slot ad-content';
                ad.innerHTML = '<span>Advertisement</span>';
                container.appendChild(ad);
            }
        }
    }
    class SmartAds {
        constructor() {
            this.max = 5;
            this.views = parseInt(sessionStorage.getItem('qn_ad_views') || '0');
            this.optOut = localStorage.getItem('qn_ads_optout') === '1';
            this.engaged = false;
            const e = () => { this.engaged = true; };
            window.addEventListener('click', e, { once: true, capture: true });
            window.addEventListener('scroll', () => {
                if (this.engaged) return;
                if (window.scrollY > 200) this.engaged = true;
            }, { passive: true });
            this.debug = false;
            this.debugUI = null;
        }
        canLoad() {
            if (this.optOut) return false;
            if (this.views >= this.max) return false;
            return true;
        }
        inc() {
            this.views += 1;
            sessionStorage.setItem('qn_ad_views', String(this.views));
        }
        report(type, status, message) {
            try { if (window.gtag) gtag('event', 'ad_'+status.toLowerCase(), { ad_type: type, detail: message || '' }); } catch(_) {}
            if (!this.debugUI) return;
            const line = document.createElement('div');
            line.textContent = type + ' • ' + status + (message ? (' • ' + message) : '');
            this.debugUI.appendChild(line);
        }
        createScript(src, onload, onerror) {
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = onload;
            s.onerror = onerror;
            return s;
        }
        load(type, slot) {
            if (!this.canLoad()) return;
            if (type === 'BANNER') {
                if (!slot) return;
                this.inc();
                const setup = document.createElement('script');
                setup.type = 'text/javascript';
                setup.text = "atOptions={'key':'2ac4da0ed6a6a60d4a1613d2215e7dd1','format':'iframe','height':60,'width':468,'params':{}};";
                const src = this.createScript(
                    'https://www.highperformanceformat.com/2ac4da0ed6a6a60d4a1613d2215e7dd1/invoke.js',
                    () => this.report('BANNER', 'Loaded'),
                    () => this.report('BANNER', 'Error')
                );
                slot.innerHTML = '';
                slot.appendChild(setup);
                slot.appendChild(src);
                return;
            }
            if (type === 'NATIVE') {
                if (!slot) return;
                this.inc();
                const div = document.createElement('div');
                div.id = 'container-b03554437e27c7af7c3e026651b104da';
                slot.innerHTML = '';
                slot.appendChild(div);
                const s = this.createScript(
                    'https://pl28401263.effectivegatecpm.com/b03554437e27c7af7c3e026651b104da/invoke.js',
                    () => this.report('NATIVE', 'Loaded'),
                    () => this.report('NATIVE', 'Error')
                );
                s.setAttribute('data-cfasync', 'false');
                slot.appendChild(s);
                return;
            }
            if (type === 'POPUNDER') {
                this.inc();
                const s = this.createScript(
                    'https://pl28401259.effectivegatecpm.com/e8/8b/0a/e88b0a7e5bf67f132b4d12b1d2d97af2.js',
                    () => this.report('POPUNDER', 'Loaded'),
                    () => this.report('POPUNDER', 'Error')
                );
                document.body.appendChild(s);
                return;
            }
            if (type === 'SOCIAL') {
                if (localStorage.getItem('qn_ad_socialbar') === '1') return;
                this.inc();
                const s = this.createScript(
                    'https://pl28401272.effectivegatecpm.com/51/1c/44/511c447359e25338ff26c7f09b965585.js',
                    () => this.report('SOCIAL', 'Loaded'),
                    () => this.report('SOCIAL', 'Error')
                );
                document.body.appendChild(s);
                localStorage.setItem('qn_ad_socialbar', '1');
                return;
            }
            if (type === 'SMARTLINK') {
                this.inc();
                window.open('https://www.effectivegatecpm.com/fvznyr7n0?key=a1519af8bf932ac2fa9472383580fc41', '_blank');
                this.report('SMARTLINK', 'Opened');
                return;
            }
        }
    }
    const isMobile = window.innerWidth <= 768;
    const headerSlot = document.querySelector('.ad-slot.ad-header');
    const contentSlot = document.querySelector('.ad-slot.ad-content');
    const footerSlot = document.querySelector('.ad-slot.ad-footer');
    const ads = new SmartAds();
    const optToggle = document.getElementById('ads-optout');
    const offersBtn = document.getElementById('offers-btn');
    const debug = new URLSearchParams(location.search).get('ads') === 'debug';
    if (debug) {
        ads.optOut = false;
        ads.debug = true;
        const panel = document.createElement('div');
        panel.style.position = 'fixed';
        panel.style.bottom = '10px';
        panel.style.right = '10px';
        panel.style.zIndex = '9999';
        panel.style.background = 'var(--bg-elevated)';
        panel.style.border = '1px solid var(--border-subtle)';
        panel.style.borderRadius = '8px';
        panel.style.boxShadow = 'var(--shadow-soft)';
        panel.style.padding = '0.75rem';
        panel.style.fontSize = '0.85rem';
        panel.style.maxWidth = '280px';
        panel.innerHTML = '<div style="font-weight:700;margin-bottom:0.5rem;">Ads Debug</div>';
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '0.5rem';
        const btnPU = document.createElement('button');
        btnPU.className = 'btn btn-sm';
        btnPU.textContent = 'Trigger Popunder';
        btnPU.onclick = () => ads.load('POPUNDER');
        const btnNative = document.createElement('button');
        btnNative.className = 'btn btn-sm';
        btnNative.textContent = 'Load Native';
        btnNative.onclick = () => { if (contentSlot) ads.load('NATIVE', contentSlot); };
        actions.appendChild(btnPU);
        actions.appendChild(btnNative);
        panel.appendChild(actions);
        const log = document.createElement('div');
        log.style.marginTop = '0.5rem';
        log.style.maxHeight = '160px';
        log.style.overflow = 'auto';
        ads.debugUI = log;
        panel.appendChild(log);
        document.body.appendChild(panel);
        if (headerSlot && !isMobile) ads.load('BANNER', headerSlot);
        if (contentSlot) ads.load('NATIVE', contentSlot);
        ads.load('SOCIAL');
    }
    const applyOptOut = () => {
        if (ads.optOut) {
            document.querySelectorAll('.ad-slot').forEach(el => { el.style.display = 'none'; });
        }
    };
    if (optToggle) {
        optToggle.checked = ads.optOut;
        optToggle.addEventListener('change', () => {
            ads.optOut = optToggle.checked;
            localStorage.setItem('qn_ads_optout', ads.optOut ? '1' : '0');
            applyOptOut();
        });
    }
    applyOptOut();
    // Faster initial ad visibility, with staged delays
    // Desktop banner early
    setTimeout(() => {
        if (ads.optOut) return;
        if (headerSlot && !isMobile) ads.load('BANNER', headerSlot);
    }, 6000);
    // Native content ad shortly after engagement or small timeout
    setTimeout(() => {
        if (ads.optOut) return;
        if (ads.engaged || performance.now() > 12000) {
            if (contentSlot) ads.load('NATIVE', contentSlot);
        }
    }, 12000);
    // Social bar later
    setTimeout(() => {
        if (ads.optOut) return;
        if (document.hasFocus()) ads.load('SOCIAL');
    }, 25000);
    // Popunder bound to first click, listener attached sooner
    setTimeout(() => {
        const t = () => {
            if (!ads.optOut) ads.load('POPUNDER');
            document.removeEventListener('click', t, true);
        };
        document.addEventListener('click', t, true);
    }, 4000);
    if (footerSlot) {
        const a = document.createElement('a');
        a.href = 'https://www.effectivegatecpm.com/fvznyr7n0?key=a1519af8bf932ac2fa9472383580fc41';
        a.textContent = 'Sponsored';
        a.style.color = 'var(--text-muted)';
        a.style.marginLeft = '0.5rem';
        footerSlot.appendChild(a);
    }
    if (offersBtn) {
        offersBtn.addEventListener('click', () => {
            if (!ads.optOut) ads.load('SMARTLINK');
        });
    }
}

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
        const q = new URLSearchParams(window.location.search).get('q');
        if (q) {
            searchInput.value = q;
            filterTools(q.toLowerCase(), getActiveCategory());
        }
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

function initShareUI() {
    if (!window.location.pathname.includes('/tools/')) return;
    const header = document.querySelector('.tool-header');
    if (!header) return;
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.gap = '0.5rem';
    wrap.style.justifyContent = 'center';
    wrap.style.marginTop = '0.75rem';
    const shareBtn = document.createElement('button');
    shareBtn.className = 'btn btn-secondary btn-sm';
    shareBtn.textContent = 'Share';
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-sm';
    copyBtn.textContent = 'Copy Link';
    const url = new URL(window.location.href);
    url.searchParams.set('utm_source', 'share');
    url.searchParams.set('utm_medium', 'button');
    url.searchParams.set('utm_campaign', 'tools');
    shareBtn.addEventListener('click', async () => {
        const title = document.title;
        const link = url.toString();
        if (navigator.share) {
            try {
                await navigator.share({ title, url: link });
                if (window.gtag) gtag('event', 'share', { method: 'navigator', page: window.location.pathname });
                if (typeof showToast !== 'undefined') showToast('Thanks for sharing!', 'success');
            } catch(e) {}
        } else {
            try {
                await navigator.clipboard.writeText(link);
                if (window.gtag) gtag('event', 'share', { method: 'copy_fallback', page: window.location.pathname });
                if (typeof showToast !== 'undefined') showToast('Link copied to clipboard', 'info');
            } catch(e) {}
        }
    });
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(url.toString());
            if (window.gtag) gtag('event', 'copy_link', { page: window.location.pathname });
            if (typeof showToast !== 'undefined') showToast('Link copied to clipboard', 'info');
        } catch(e) {}
    });
    wrap.appendChild(shareBtn);
    wrap.appendChild(copyBtn);
    header.appendChild(wrap);
}

function initToolSchema() {
    if (typeof toolsData === 'undefined') return;
    const tool = toolsData.find(t => t.link === window.location.pathname);
    if (!tool) return;
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": tool.name,
        "applicationCategory": "Utilities",
        "operatingSystem": "Web",
        "url": window.location.origin + tool.link,
        "description": tool.desc,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    };
    s.text = JSON.stringify(schema);
    document.head.appendChild(s);
}

function initTrending() {
    const grid = document.getElementById('trending-tools');
    if (!grid || typeof toolsData === 'undefined') return;
    const picks = toolsData.filter(t => Array.isArray(t.badges) && (t.badges.includes('popular') || t.badges.includes('new'))).slice(0, 6);
    grid.innerHTML = picks.map(t => {
        const u = new URL(window.location.origin + t.link);
        u.searchParams.set('utm_source', 'trending');
        u.searchParams.set('utm_medium', 'grid');
        u.searchParams.set('utm_campaign', 'homepage');
        return `
        <div class="tool-card fade-in">
            <div class="tool-icon">${t.icon}</div>
            <h3 class="tool-title">${t.name}</h3>
            <p class="tool-desc">${t.desc}</p>
            <div style="display:flex;gap:0.5rem;margin-top:auto;">
                <a href="${t.link}" class="btn btn-secondary btn-sm" style="flex:1">Open</a>
                <button class="btn btn-sm" data-share="${u.toString()}">Share</button>
            </div>
        </div>`;
    }).join('');
    grid.querySelectorAll('button[data-share]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const link = btn.getAttribute('data-share');
            if (navigator.share) {
                try { await navigator.share({ title: document.title, url: link }); } catch(e) {}
            } else {
                try { await navigator.clipboard.writeText(link); } catch(e) {}
            }
            if (window.gtag) gtag('event', 'share', { method: navigator.share ? 'navigator' : 'copy', page: 'home' });
        });
    });
}

function initInvite() {
    const btn = document.getElementById('invite-btn');
    if (!btn) return;
    const u = new URL(window.location.href);
    u.searchParams.set('utm_source', 'invite');
    u.searchParams.set('utm_medium', 'footer');
    u.searchParams.set('utm_campaign', 'growth');
    btn.addEventListener('click', async () => {
        const link = u.toString();
        if (navigator.share) {
            try { await navigator.share({ title: 'QuickNova', url: link }); } catch(e) {}
        } else {
            try { await navigator.clipboard.writeText(link); } catch(e) {}
        }
        if (window.gtag) gtag('event', 'invite_share', { page: window.location.pathname });
        if (typeof showToast !== 'undefined') showToast('Invite link ready to share', 'success');
    });
}

function initHomeShareNudge() {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;
    const key = 'qn_home_visits';
    let v = parseInt(localStorage.getItem(key) || '0');
    v += 1;
    localStorage.setItem(key, String(v));
    if (v === 2 || v === 5) {
        setTimeout(() => {
            if (typeof showToast !== 'undefined') showToast('Enjoying QuickNova? Share with a friend!', 'info');
        }, 2000);
    }
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
