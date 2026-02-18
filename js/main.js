document.addEventListener('DOMContentLoaded', () => {
    // Consent-first: show consent banner and initialize analytics/ads only after user grants permission
    initTheme();
    initMobileMenu();
    initSmartFeatures();
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

    initConsentBanner();
    // Dynamic meta and referral systems
    initDynamicMeta();
    initReferral();
    initShareTemplates();
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

// Consent banner: must be called on DOMContentLoaded
function initConsentBanner() {
    try {
        const stored = localStorage.getItem('qn_consent');
        if (stored === 'granted') {
            initAnalytics();
            // Small delay to ensure DOM ready for ad insertion
            setTimeout(() => initAds(), 200);
            return;
        }
        if (stored === 'denied') {
            // Respect denial: set ads opt-out
            try { localStorage.setItem('qn_ads_optout', '1'); } catch(e){}
            return;
        }
    } catch (e) {
        console.warn('Consent read error', e);
    }

    // Create banner
    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;z-index:99999;background:var(--bg-elevated);border:1px solid var(--border-subtle);padding:12px;border-radius:10px;display:flex;gap:12px;align-items:center;box-shadow:var(--shadow-soft);';
    banner.innerHTML = `
        <div style="flex:1;">
            <strong>Privacy & Analytics</strong>
            <div style="color:var(--text-muted);font-size:0.95rem;margin-top:4px;">We use analytics and ads to keep QuickNova free. Do you allow anonymous analytics and non-intrusive ads?</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
            <button id="consent-accept" class="btn btn-primary">Allow</button>
            <button id="consent-decline" class="btn btn-secondary">Decline</button>
            <a href="/privacy.html" style="color:var(--text-muted);font-size:0.9rem;margin-left:8px;">Privacy</a>
        </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('consent-accept').addEventListener('click', () => {
        try { localStorage.setItem('qn_consent', 'granted'); } catch (e) {}
        // Initialize analytics and ads
        initAnalytics();
        setTimeout(() => initAds(), 200);
        banner.remove();
    });

    document.getElementById('consent-decline').addEventListener('click', () => {
        try { localStorage.setItem('qn_consent', 'denied'); localStorage.setItem('qn_ads_optout','1'); } catch (e) {}
        // Ensure ads hidden
        document.querySelectorAll('.ad-slot').forEach(el => el.style.display = 'none');
        banner.remove();
    });
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
            try {
                this.views = parseInt(sessionStorage.getItem('qn_ad_views') || '0');
            } catch (e) {
                this.views = 0;
            }
            try {
                this.optOut = localStorage.getItem('qn_ads_optout') === '1';
            } catch (e) {
                this.optOut = false;
            }
            this.engaged = false;
            const e = () => { this.engaged = true; };
            window.addEventListener('click', e, { once: true, capture: true });
            window.addEventListener('scroll', () => {
                if (this.engaged) return;
                if (window.scrollY > 200) this.engaged = true;
            }, { passive: true });
            this.debug = false;
            this.debugUI = null;
            this.loadedCount = 0;
        }
        canLoad() {
            if (this.optOut) return false;
            if (this.views >= this.max) return false;
            return true;
        }
        inc() {
            this.views += 1;
            this.loadedCount += 1;
            try {
                sessionStorage.setItem('qn_ad_views', String(this.views));
            } catch (e) {}
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
            // Lazy-load ad scripts to avoid blocking and to respect consent
            s.src = src;
            s.async = true;
            s.defer = true;
            s.onerror = onerror;
            if (onload) s.onload = onload;
            return s;
        }
        load(type, slot) {
            if (!this.canLoad()) {
                if (slot) {
                    slot.innerHTML = '<span style="color: var(--text-muted); font-size: 0.75rem;">Ad limit reached</span>';
                }
                return;
            }
            
            if (type === 'BANNER') {
                if (!slot) return;
                this.inc();
                try {
                    const setup = document.createElement('script');
                    setup.type = 'text/javascript';
                    setup.text = "atOptions={'key':'2ac4da0ed6a6a60d4a1613d2215e7dd1','format':'iframe','height':60,'width':468,'params':{}};";
                    // Only load heavy banner scripts on non-mobile AND after consent
                    const consent = (function(){ try{ return localStorage.getItem('qn_consent')==='granted'; }catch(e){return false;} })();
                    const isMobile = window.innerWidth <= 768;
                    if (!consent || isMobile) {
                        slot.innerHTML = '<div style="padding:12px;color:var(--text-muted);font-size:0.9rem;">Ad space (non-intrusive)</div>';
                        this.report('BANNER','Deferred','Mobile or no consent');
                        return;
                    }
                    const src = this.createScript(
                        'https://www.highperformanceformat.com/2ac4da0ed6a6a60d4a1613d2215e7dd1/invoke.js',
                        () => this.report('BANNER', 'Loaded'),
                        () => this.report('BANNER', 'Error')
                    );
                    slot.innerHTML = '';
                    slot.appendChild(setup);
                    slot.appendChild(src);
                } catch (e) {
                    console.error('Banner ad error:', e);
                    this.report('BANNER', 'Error', e.message);
                }
                return;
            }
            if (type === 'NATIVE') {
                if (!slot) return;
                this.inc();
                try {
                    const div = document.createElement('div');
                    div.id = 'container-b03554437e27c7af7c3e026651b104da';
                    slot.innerHTML = '';
                    slot.appendChild(div);
                    const s = this.createScript(
                        'https://pl28401263.effectivegatecpm.com/b03554437e27c7af7c3e026651b104da/invoke.js',
                        () => this.report('NATIVE', 'Loaded'),
                        () => this.report('NATIVE', 'Error')
                    try {
                        const consent = (function(){ try{ return localStorage.getItem('qn_consent')==='granted'; }catch(e){return false;} })();
                        const isMobile = window.innerWidth <= 768;
                        if (!consent) {
                            slot.innerHTML = '<div style="padding:10px;color:var(--text-muted);font-size:0.9rem;">Ad (consent required)</div>';
                            this.report('NATIVE','Deferred','No consent');
                            return;
                        }
                        if (isMobile) {
                            // Load a lightweight native placeholder on mobile
                            slot.innerHTML = '<div style="padding:10px;color:var(--text-muted);font-size:0.9rem;">Sponsored - try our premium tools</div>';
                            this.report('NATIVE','Placeholder','Mobile lightweight');
                            this.inc();
                            return;
                        }
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
                    } catch (e) {
                        console.error('Native ad error:', e);
                        this.report('NATIVE', 'Error', e.message);
                    }
                    );
                    document.body.appendChild(s);
                } catch (e) {
                    console.error('Popunder ad error:', e);
                    this.report('POPUNDER', 'Error', e.message);
                }
                return;
            }
            if (type === 'SOCIAL') {
                try {
                    if (localStorage.getItem('qn_ad_socialbar') === '1') return;
                } catch (e) { return; }
                this.inc();
                try {
                    const s = this.createScript(
                        'https://pl28401272.effectivegatecpm.com/51/1c/44/511c447359e25338ff26c7f09b965585.js',
                        () => this.report('SOCIAL', 'Loaded'),
                        () => this.report('SOCIAL', 'Error')
                    );
                    document.body.appendChild(s);
                    try {
                        localStorage.setItem('qn_ad_socialbar', '1');
                    } catch (e) {}
                } catch (e) {
                    console.error('Social ad error:', e);
                    this.report('SOCIAL', 'Error', e.message);
                }
                return;
            }
            if (type === 'SMARTLINK') {
                this.inc();
                try {
                    window.open('https://www.effectivegatecpm.com/fvznyr7n0?key=a1519af8bf932ac2fa9472383580fc41', '_blank');
                    this.report('SMARTLINK', 'Opened');
                } catch (e) {
                    console.error('Smartlink error:', e);
                    this.report('SMARTLINK', 'Error', e.message);
                }
                return;
            }
        }
    }
    const isMobile = window.innerWidth <= 768;
    const headerSlot = document.querySelector('.ad-slot.ad-header');
    const contentSlot = document.querySelector('.ad-slot.ad-content');
    const contentBottomSlot = document.querySelector('.ad-slot.ad-content-bottom');
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
        btnNative.onclick = () => { if (contentSlot) ads.load('NATIVE', contentSlot); if (contentBottomSlot) ads.load('NATIVE', contentBottomSlot); };
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
        if (contentBottomSlot) ads.load('NATIVE', contentBottomSlot);
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
            try {
                localStorage.setItem('qn_ads_optout', ads.optOut ? '1' : '0');
            } catch (e) {}
            applyOptOut();
        });
    }
    applyOptOut();
    // INSTANT banner ads - load immediately
    if (!ads.optOut && headerSlot && !isMobile) {
        ads.load('BANNER', headerSlot);
    }
    if (!ads.optOut && footerSlot && !isMobile) {
        ads.load('BANNER', footerSlot);
    }
    // Additional banner slots for more revenue
    if (!ads.optOut) {
        // Create additional banner slots
        const topBanner = document.createElement('div');
        topBanner.className = 'ad-slot ad-banner-top';
        topBanner.style.cssText = 'text-align:center;margin:10px 0;';
        const firstContent = document.querySelector('.tool-workspace, .tool-container, main, .content');
        if (firstContent) {
            firstContent.parentNode.insertBefore(topBanner, firstContent);
            ads.load('BANNER', topBanner);
        }
    }
    // INSTANT native ads
    if (!ads.optOut) {
        if (contentSlot) ads.load('NATIVE', contentSlot);
        if (contentBottomSlot) ads.load('NATIVE', contentBottomSlot);
    }
    // INSTANT social bar
    if (!ads.optOut) {
        ads.load('SOCIAL');
    }
    // INSTANT popunder on load
    if (!ads.optOut) {
        // Avoid intrusive popunder on mobile devices
        if (!isMobile) {
            ads.load('POPUNDER');
        }
    }
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
    
    // Add MORE banner ads for higher revenue
    if (!ads.optOut) {
        // Sidebar banner for desktop
        if (!isMobile) {
            const sidebar = document.querySelector('.sidebar, .tool-sidebar, .aside');
            if (sidebar) {
                const sideBanner = document.createElement('div');
                sideBanner.className = 'ad-slot ad-sidebar';
                sideBanner.style.cssText = 'text-align:center;margin:20px 0;';
                sidebar.appendChild(sideBanner);
                ads.load('BANNER', sideBanner);
            }
        }
        
        // Between content sections
        const sections = document.querySelectorAll('.tool-section, .content-section, .card');
        if (sections.length >= 2) {
            const midBanner = document.createElement('div');
            midBanner.className = 'ad-slot ad-mid-content';
            midBanner.style.cssText = 'text-align:center;margin:20px 0;';
            sections[Math.floor(sections.length / 2)].parentNode.insertBefore(midBanner, sections[Math.floor(sections.length / 2)]);
            ads.load('BANNER', midBanner);
        }
        
        // Sticky bottom banner
        const stickyBanner = document.createElement('div');
        stickyBanner.className = 'ad-slot ad-sticky-bottom';
        stickyBanner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;text-align:center;background:var(--bg-elevated);border-top:1px solid var(--border-subtle);padding:10px;z-index:1000;';
        document.body.appendChild(stickyBanner);
        ads.load('BANNER', stickyBanner);
    }
}
}

// --- Theme Handling ---
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let storedTheme;
    try {
        storedTheme = localStorage.getItem('theme');
    } catch (e) {}

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
            try {
                localStorage.setItem('theme', newTheme);
            } catch (e) {}
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

// ===== SMART FEATURES SYSTEM =====
function initSmartFeatures() {
    // 1. Smart Tool Recommendations Based on User History
    initSmartRecommendations();
    
    // 2. Mobile-Specific Smart Features
    if (isMobileView()) {
        initMobileSmartFeatures();
    }
    
    // 3. Context-aware Quick Actions
    initQuickActions();
    
    // 4. User Behavior Analytics
    trackUserBehavior();
}

function isMobileView() {
    return window.innerWidth <= 768;
}

// FEATURE 1: Smart Recommendations
function initSmartRecommendations() {
    const container = document.querySelector('.hero, .home-hero, main > section:first-child, .tools-container');
    if (!container) return;
    
    // Get user history and favorites
    let recentTools = getRecent();
    let favTools = getFavorites();
    
    if (recentTools.length === 0 && favTools.length === 0) {
        // New user - show trending instead
        suggestTrendingTools();
    } else {
        // Suggest related tools based on usage
        suggestRelatedTools(recentTools, favTools);
    }
}

function suggestTrendingTools() {
    if (document.querySelector('[data-smart-section="trending"]')) return;
    
    const trendingTools = toolsData.filter(t => t.badges && t.badges.includes('popular'));
    if (trendingTools.length === 0) return;
    
    const section = document.createElement('section');
    section.setAttribute('data-smart-section', 'trending');
    section.style.cssText = 'margin: 2rem 0; padding: 1.5rem; background: var(--bg-elevated); border-radius: 12px; border: 1px solid var(--border-subtle);';
    
    section.innerHTML = `
        <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.3rem;">🔥</span> Trending Tools
        </h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Tools loved by thousands of users</p>
        <div id="trending-quick-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;"></div>
    `;
    
    const mainContent = document.querySelector('main, .main-content');
    if (mainContent) {
        mainContent.insertBefore(section, mainContent.firstChild);
    }
    
    const grid = section.querySelector('#trending-quick-grid');
    trendingTools.slice(0, 6).forEach(tool => {
        const card = document.createElement('a');
        card.href = tool.link;
        card.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; background: var(--bg); border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.3s ease; border: 1px solid transparent;';
        card.innerHTML = `<div style="font-size: 2rem;">${tool.icon}</div><span style="font-size: 0.75rem; text-align: center; font-weight: 500;">${tool.name}</span>`;
        card.onmouseover = () => card.style.cssText += 'border-color: var(--accent-blue); transform: translateY(-2px);';
        card.onmouseout = () => card.style.cssText = card.style.cssText.replace('border-color: var(--accent-blue); transform: translateY(-2px);', '');
        grid.appendChild(card);
    });
}

function suggestRelatedTools(recentTools, favTools) {
    const allUsedIds = [...new Set([...recentTools, ...favTools])];
    if (allUsedIds.length === 0) return;
    
    // Get category of most recent tools
    const usedTools = toolsData.filter(t => allUsedIds.includes(t.id));
    const categories = [...new Set(usedTools.map(t => t.category))];
    
    // Find related tools in same categories
    const relatedTools = toolsData.filter(t => 
        !allUsedIds.includes(t.id) && categories.includes(t.category)
    ).slice(0, 4);
    
    if (relatedTools.length === 0) return;
    
    const section = document.createElement('section');
    section.setAttribute('data-smart-section', 'recommendations');
    section.style.cssText = 'margin: 2rem 0; padding: 1.5rem; background: linear-gradient(135deg, var(--bg-elevated), var(--bg)); border-radius: 12px; border: 1px solid var(--border-subtle);';
    
    section.innerHTML = `
        <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.3rem;">💡</span> Recommended For You
        </h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Based on your recent activity</p>
        <div id="recommendations-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;"></div>
    `;
    
    const mainContent = document.querySelector('main, .main-content');
    if (mainContent) {
        mainContent.insertBefore(section, mainContent.firstChild);
    }
    
    const grid = section.querySelector('#recommendations-grid');
    relatedTools.forEach(tool => {
        const card = document.createElement('a');
        card.href = tool.link;
        card.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; background: var(--bg); border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.3s ease; border: 1px solid var(--accent-blue);';
        card.innerHTML = `<div style="font-size: 2rem;">${tool.icon}</div><span style="font-size: 0.75rem; text-align: center; font-weight: 500;">${tool.name}</span>`;
        grid.appendChild(card);
    });
}

// FEATURE 2: Mobile-Specific Smart Features
function initMobileSmartFeatures() {
    // Add touch-friendly spacing
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach(card => {
        card.style.minHeight = '280px';
        card.style.padding = '1.25rem';
        
        // Make buttons bigger on mobile
        const buttons = card.querySelectorAll('a.btn, button.btn');
        buttons.forEach(btn => {
            btn.style.padding = '0.75rem 1rem';
            btn.style.minHeight = '44px'; // iOS recommended touch target
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
        });
    });
    
    // Add swipe gestures
    enableSwipeGestures();
    
    // Add tap-friendly search
    enhanceMobileSearch();
    
    // Bottom navigation for mobile
    initMobileBottomBar();
    // Auto-hide header on scroll for immersive mobile view
    initHeaderAutoHide();
}

function enableSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left
                const nav = document.querySelector('.nav-links');
                if (nav) nav.style.display = 'none';
            } else {
                // Swiped right
                const nav = document.querySelector('.nav-links');
                if (nav && isMobileView()) nav.style.display = 'flex';
            }
        }
    }
}

function initMobileBottomBar() {
    if (!isMobileView()) return;
    if (document.getElementById('qn-mobile-bar')) return;
    const bar = document.createElement('nav');
    bar.id = 'qn-mobile-bar';
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:9999;background:var(--bg-elevated);border-top:1px solid var(--border-subtle);display:flex;justify-content:space-around;padding:8px 6px;gap:6px;box-shadow:var(--shadow-soft);';

    const btns = [
        {id:'home', icon:'🏠', href:'/'},
        {id:'tools', icon:'🧰', href:'/tools/'},
        {id:'share', icon:'🔗', action:'share'},
        {id:'theme', icon:'🌓', action:'theme'},
        {id:'search', icon:'🔎', action:'search'}
    ];

    btns.forEach(b => {
        const el = document.createElement('button');
        el.className = 'btn-icon';
        el.style.cssText = 'background:none;border:none;font-size:1.25rem;display:flex;align-items:center;justify-content:center;padding:8px;border-radius:8px;min-width:48px;min-height:44px;';
        el.innerHTML = b.icon;
        if (b.href) el.addEventListener('click', () => location.href = b.href);
        if (b.action === 'share') el.addEventListener('click', async () => {
            const url = window.location.href;
            if (navigator.share) { try { await navigator.share({ title: document.title, url }); if (window.gtag) gtag('event','share',{method:'navigator'}); } catch(_){} }
            else { try { await navigator.clipboard.writeText(url); if (window.gtag) gtag('event','share',{method:'copy'}); if (typeof showToast!=='undefined') showToast('Link copied', 'info'); } catch(_){} }
        });
        if (b.action === 'theme') el.addEventListener('click', () => {
            const cur = document.documentElement.getAttribute('data-theme');
            const nw = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', nw);
            try { localStorage.setItem('theme', nw); } catch(e){}
            updateThemeIcon(nw === 'dark');
        });
        if (b.action === 'search') el.addEventListener('click', () => {
            const s = document.querySelector('.search-input, input[type="search"]'); if (s) { s.focus(); window.scrollTo({top: s.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth'}); }
        });
        bar.appendChild(el);
    });

    document.body.appendChild(bar);
    // ensure body has safe bottom padding so content isn't hidden
    document.body.style.paddingBottom = Math.max(parseInt(getComputedStyle(document.body).paddingBottom||0), 70) + 'px';
}

function initHeaderAutoHide() {
    if (!isMobileView()) return;
    const header = document.querySelector('.site-header');
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return; ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            if (y > lastY && y > 80) {
                // scrolling down
                header.style.transform = 'translateY(-100%)';
                header.style.transition = 'transform 0.25s ease';
            } else {
                header.style.transform = '';
            }
            lastY = y;
            ticking = false;
        });
    }, { passive: true });
}

function enhanceMobileSearch() {
    const searchInput = document.querySelector('.search-input, input[placeholder*="search" i], input[type="search"]');
    if (!searchInput) return;
    
    // Add clear button
    const wrapper = searchInput.parentElement;
    if (wrapper && !wrapper.querySelector('.search-clear')) {
        const clearBtn = document.createElement('button');
        clearBtn.className = 'search-clear';
        clearBtn.innerHTML = '✕';
        clearBtn.type = 'button';
        clearBtn.style.cssText = 'position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem; padding: 0;';
        clearBtn.onclick = () => {
            searchInput.value = '';
            searchInput.focus();
            filterTools('', getActiveCategory());
            clearBtn.style.display = 'none';
        };
        
        wrapper.style.position = 'relative';
        wrapper.appendChild(clearBtn);
        
        searchInput.addEventListener('input', () => {
            clearBtn.style.display = searchInput.value ? 'block' : 'none';
        });
    }
}

// FEATURE 3: Quick Actions
function initQuickActions() {
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        addQuickActionButtons();
    }
}

function addQuickActionButtons() {
    if (document.querySelector('[data-smart-section="quick-actions"]')) return;
    
    const section = document.createElement('section');
    section.setAttribute('data-smart-section', 'quick-actions');
    section.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 0.75rem;
        margin: 1.5rem 0;
        padding: 1rem;
        background: var(--bg-elevated);
        border-radius: 12px;
        border: 1px solid var(--border-subtle);
    `;
    
    const actions = [
        { icon: '🎨', label: 'Image Tools', category: 'image' },
        { icon: '📄', label: 'PDF Tools', category: 'pdf' },
        { icon: '🤖', label: 'AI Tools', category: 'ai' },
        { icon: '⚙️', label: 'Utilities', category: 'utility' },
        { icon: '🎵', label: 'Audio/Video', category: 'audio-video' }
    ];
    
    actions.forEach(action => {
        const btn = document.createElement('button');
        btn.className = 'quick-action-btn';
        btn.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            background: var(--bg);
            border: 1px solid var(--border-subtle);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            color: inherit;
            font-size: 0.85rem;
            font-weight: 500;
            min-height: 80px;
            justify-content: center;
        `;
        btn.innerHTML = `<div style="font-size: 1.5rem;">${action.icon}</div><div>${action.label}</div>`;
        btn.onclick = () => {
            const searchInput = document.getElementById('search-tools');
            if (searchInput) {
                searchInput.value = '';
                filterTools('', action.category);
            }
        };
        btn.onmouseover = () => btn.style.cssText += 'border-color: var(--accent-blue); transform: translateY(-2px);';
        section.appendChild(btn);
    });
    
    const mainContent = document.querySelector('main, .main-content');
    if (mainContent) {
        mainContent.insertBefore(section, mainContent.firstChild);
    }
}

// FEATURE 4: Track User Behavior
function trackUserBehavior() {
    // Track which tools users visit and when
    document.addEventListener('click', (e) => {
        const toolLink = e.target.closest('a[href*="/tools/"]');
        if (toolLink) {
            const toolPath = toolLink.href;
            try {
                const lastClicks = JSON.parse(localStorage.getItem('qn_tool_clicks') || '{}');
                lastClicks[toolPath] = Date.now();
                localStorage.setItem('qn_tool_clicks', JSON.stringify(lastClicks));
            } catch (e) {
                console.warn('Could not track tool click:', e);
            }
        }
    });
    
    // Track time spent on page
    let timeOnPage = 0;
    setInterval(() => {
        if (document.hidden) return;
        timeOnPage++;
        if (timeOnPage % 30 === 0) { // Save every 30 seconds
            try {
                const toolVisit = window.location.pathname;
                const visits = JSON.parse(localStorage.getItem('qn_visits_stats') || '{}');
                visits[toolVisit] = (visits[toolVisit] || 0) + 30;
                localStorage.setItem('qn_visits_stats', JSON.stringify(visits));
            } catch (e) {
                console.warn('Could not track time spent:', e);
            }
        }
    }, 1000);
}

// --- Mobile Menu ---
function initMobileMenu() {
    // Enhanced mobile menu with smooth animations
    const btn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav-links');
    
    if (!btn || !nav) return;
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-menu-btn') && !e.target.closest('.nav-links')) {
            nav.classList.remove('active');
            nav.style.maxHeight = '0';
        }
    });
    
    // Toggle menu on button click
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = nav.classList.contains('active');
        
        if (isActive) {
            nav.classList.remove('active');
            nav.style.maxHeight = '0';
        } else {
            nav.classList.add('active');
            nav.style.maxHeight = nav.scrollHeight + 'px';
        }
    });
    
    // Close menu when clicking on a link
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            nav.style.maxHeight = '0';
        });
    });
    
    // Update menu height on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (nav.classList.contains('active')) {
                nav.style.maxHeight = nav.scrollHeight + 'px';
            }
        }, 250);
    });
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
        <div class="tool-card" data-category="${tool.category}" data-id="${tool.id}">
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
    const searchBtn = document.getElementById('search-btn');
    const searchForm = document.querySelector('form[action="/"]');
    const filterChips = document.querySelectorAll('.filter-chip');
    
    if (searchInput) {
        const q = new URLSearchParams(window.location.search).get('q');
        if (q) {
            searchInput.value = q;
            filterTools(q, getActiveCategory());
        }
        
        // Keyboard shortcut (Ctrl/Cmd + K)
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.style.borderColor = 'var(--accent-blue)';
                setTimeout(() => searchInput.style.borderColor = '', 300);
            }
        });

        // Real-time filtering as you type
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            filterTools(query, getActiveCategory());
        });
    }

    // Prevent form submission for instant results
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput ? searchInput.value.trim() : '';
            filterTools(query, getActiveCategory());
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const query = searchInput ? searchInput.value.trim() : '';
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
                const query = searchInput ? searchInput.value.trim() : '';
                filterTools(query, category);
            });
        });
    }
}

function getActiveCategory() {
    const activeChip = document.querySelector('.filter-chip.active');
    return activeChip ? activeChip.getAttribute('data-category') : 'all';
}

function filterTools(query, category, fuse) {
    if (typeof toolsData === 'undefined') return;

    let base = toolsData;
    if (category === 'favorites') {
        const favs = getFavorites();
        base = toolsData.filter(t => favs.includes(t.id));
    } else if (category !== 'all') {
        base = toolsData.filter(t => t.category === category);
    }
    
    let filtered;
    if (query.trim() === '') {
        filtered = base;
    } else {
        // Simple filter for reliable matching
        filtered = base.filter(tool => 
            tool.name.toLowerCase().includes(query.toLowerCase()) || 
            tool.desc.toLowerCase().includes(query.toLowerCase())
        );
    }

    renderTools(filtered);
}

function toggleFavorite(id) {
    const favs = getFavorites();
    const idx = favs.indexOf(id);
    if (idx >= 0) favs.splice(idx, 1); else favs.push(id);
    try {
        localStorage.setItem('qn_favorites', JSON.stringify(favs));
    } catch (e) {}
}

function recordRecent() {
    if (typeof toolsData === 'undefined') return;
    const path = window.location.pathname;
    const tool = toolsData.find(t => t.link === path);
    if (!tool) return;
    let recent = [];
    try { recent = JSON.parse(localStorage.getItem('qn_recent') || '[]'); } catch(e) { recent = []; }
    recent = [tool.id].concat(recent.filter(id => id !== tool.id)).slice(0, 20);
    try {
        localStorage.setItem('qn_recent', JSON.stringify(recent));
    } catch (e) {}
}

function initStreak() {
    try {
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
    } catch (e) {}
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

// Dynamic metadata for tool pages using toolsData
function initDynamicMeta() {
    try {
        const path = window.location.pathname;
        // normalize links in toolsData (they may start with /tools/)
        const tool = toolsData && toolsData.find(t => t.link && (t.link === path || t.link === path.replace(/\/g, '/')));
        if (!tool) return;

        // Title
        document.title = `${tool.name} — QuickNova`;

        // Description
        let descMeta = document.querySelector('meta[name="description"]');
        if (!descMeta) {
            descMeta = document.createElement('meta');
            descMeta.name = 'description';
            document.head.appendChild(descMeta);
        }
        descMeta.content = tool.desc || 'QuickNova tool';

        // Open Graph
        const ogTitle = ensureMeta('property', 'og:title');
        ogTitle.content = `${tool.name} — QuickNova`;
        const ogDesc = ensureMeta('property', 'og:description');
        ogDesc.content = tool.desc || '';
        const ogUrl = ensureMeta('property', 'og:url');
        ogUrl.content = window.location.href;
        const ogImage = ensureMeta('property', 'og:image');
        ogImage.content = tool.image || (window.location.origin + '/assets/og-image.jpg');

        // Twitter card
        const twCard = ensureMeta('name', 'twitter:card');
        twCard.content = 'summary_large_image';
        const twTitle = ensureMeta('name', 'twitter:title');
        twTitle.content = `${tool.name} — QuickNova`;
        const twDesc = ensureMeta('name', 'twitter:description');
        twDesc.content = tool.desc || '';
        const twImage = ensureMeta('name', 'twitter:image');
        twImage.content = tool.image || (window.location.origin + '/assets/og-image.jpg');

        // JSON-LD structured data for tool
        const ld = document.createElement('script');
        ld.type = 'application/ld+json';
        ld.id = 'qn-tool-schema';
        ld.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": tool.name,
            "url": window.location.href,
            "description": tool.desc,
            "applicationCategory": tool.category || 'Tools',
            "image": tool.image || (window.location.origin + '/assets/og-image.jpg')
        });
        document.head.appendChild(ld);
    } catch (e) {
        console.warn('Dynamic meta error', e);
    }
}

function ensureMeta(attrName, attrValue) {
    let sel;
    if (attrName === 'property') sel = `meta[property="${attrValue}"]`;
    else sel = `meta[name="${attrValue}"]`;
    let m = document.head.querySelector(sel);
    if (!m) {
        m = document.createElement('meta');
        if (attrName === 'property') m.setAttribute('property', attrValue);
        else m.name = attrValue;
        document.head.appendChild(m);
    }
    return m;
}

// Referral system (consent-first, opt-in)
function initReferral() {
    try {
        const existing = localStorage.getItem('qn_referral_code');
        if (existing) return; // already generated
        // gentle prompt after a delay
        setTimeout(() => {
            showReferralBanner();
        }, 3000);
    } catch (e) { console.warn('Referral init error', e); }
}

function showReferralBanner() {
    if (document.getElementById('qn-ref-banner')) return;
    const banner = document.createElement('div');
    banner.id = 'qn-ref-banner';
    banner.style.cssText = 'position:fixed;bottom:18px;left:18px;right:18px;z-index:99998;background:var(--bg-elevated);padding:12px;border-radius:10px;border:1px solid var(--border-subtle);display:flex;align-items:center;gap:12px;';
    banner.innerHTML = `
        <div style="flex:1;font-size:0.95rem;color:var(--text-main);">Invite friends and earn rewards — create your referral code?</div>
        <div style="display:flex;gap:8px;">
            <button id="qn-ref-create" class="btn btn-primary">Create Code</button>
            <button id="qn-ref-dismiss" class="btn btn-secondary">Dismiss</button>
        </div>
    `;
    document.body.appendChild(banner);
    document.getElementById('qn-ref-dismiss').addEventListener('click', () => banner.remove());
    document.getElementById('qn-ref-create').addEventListener('click', () => {
        const code = 'qn-' + Math.random().toString(36).slice(2, 9);
        try { localStorage.setItem('qn_referral_code', code); } catch (e) {}
        banner.remove();
        showToast && showToast('Referral code created: ' + code, 'success');
    });
}

// Share templates - append referral and UTM when present
function initShareTemplates() {
    try {
        const ref = localStorage.getItem('qn_referral_code');
        // patch existing social share buttons if present
        const socialBtns = document.querySelectorAll('.social-share-float button');
        socialBtns.forEach(btn => {
            const old = btn.onclick;
            btn.onclick = function(e) {
                // build shared url
                const base = window.location.href.split('#')[0];
                const url = new URL(base);
                if (ref) url.searchParams.set('ref', ref);
                url.searchParams.set('utm_source', 'share');
                // call original handler with modified URL if it uses window.open
                if (this.title && this.title.toLowerCase().includes('whatsapp')) {
                    window.open(`https://wa.me/?text=${encodeURIComponent(url.toString())}`,'_blank');
                    if (window.gtag) gtag('event','share',{method:'whatsapp'});
                    return;
                }
                if (this.title && this.title.toLowerCase().includes('telegram')) {
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(url.toString())}`,'_blank');
                    if (window.gtag) gtag('event','share',{method:'telegram'});
                    return;
                }
                // fallback to original
                if (typeof old === 'function') old();
            };
        });
    } catch (e) { console.warn('Share templates error', e); }
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
            // append referral if exists
            const ref = (function(){ try{ return localStorage.getItem('qn_referral_code'); }catch(e){return null;} })();
            const full = new URL(url.toString());
            if (ref) full.searchParams.set('ref', ref);
            await navigator.clipboard.writeText(full.toString());
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

// Handle referral query param on landing
(function handleReferralParam(){
    try {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (!ref) return;
        // store the ref for later attribution
        try { localStorage.setItem('qn_last_ref', ref); } catch (e) {}
        // Optionally show a subtle thank you
        setTimeout(() => {
            if (typeof showToast !== 'undefined') showToast('Thanks for visiting via referral!', 'info');
        }, 1200);
    } catch (e) {}
})();

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
    let v;
    try {
        v = parseInt(localStorage.getItem(key) || '0');
    } catch (e) {
        v = 0;
    }
    v += 1;
    try {
        localStorage.setItem(key, String(v));
    } catch (e) {}
    if (v === 2 || v === 5) {
        setTimeout(() => {
            if (typeof showToast !== 'undefined') showToast('Enjoying QuickNova? Share with a friend!', 'info');
        }, 2000);
    }
}

// NEW: WhatsApp/Telegram share shortcuts
function initSocialShare() {
    const shareContainer = document.createElement('div');
    shareContainer.className = 'social-share-float';
    shareContainer.style.cssText = 'position:fixed;right:20px;bottom:100px;z-index:999;display:flex;flex-direction:column;gap:10px;';
    
    const whatsappBtn = document.createElement('button');
    whatsappBtn.innerHTML = '💬';
    whatsappBtn.title = 'Share on WhatsApp';
    whatsappBtn.style.cssText = 'width:50px;height:50px;border-radius:50%;background:#25D366;color:white;border:none;font-size:20px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.3);';
    whatsappBtn.onclick = () => {
        const url = encodeURIComponent(window.location.href + '?utm_source=whatsapp&utm_medium=share&utm_campaign=social');
        window.open(`https://wa.me/?text=${url}`, '_blank');
        if (window.gtag) gtag('event', 'share', { method: 'whatsapp' });
    };
    
    const telegramBtn = document.createElement('button');
    telegramBtn.innerHTML = '✈️';
    telegramBtn.title = 'Share on Telegram';
    telegramBtn.style.cssText = 'width:50px;height:50px;border-radius:50%;background:#0088cc;color:white;border:none;font-size:20px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.3);';
    telegramBtn.onclick = () => {
        const url = encodeURIComponent(window.location.href + '?utm_source=telegram&utm_medium=share&utm_campaign=social');
        window.open(`https://t.me/share/url?url=${url}`, '_blank');
        if (window.gtag) gtag('event', 'share', { method: 'telegram' });
    };
    
    shareContainer.appendChild(whatsappBtn);
    shareContainer.appendChild(telegramBtn);
    document.body.appendChild(shareContainer);
}

// NEW: Top searches chips bar
function initTopSearches() {
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;
    const topSearches = ['PDF', 'Image', 'AI', 'QR', 'Password', 'Text', 'Color', 'JSON'];
    const container = document.createElement('div');
    container.className = 'top-searches';
    container.style.cssText = 'text-align:center;margin:20px 0;padding:15px;background:var(--bg-elevated);border-radius:8px;';
    container.innerHTML = '<h3 style="margin-bottom:10px;">🔥 Popular Tools</h3>';
    
    const chips = document.createElement('div');
    chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;';
    
    topSearches.forEach(term => {
        const chip = document.createElement('a');
        chip.href = `/?q=${encodeURIComponent(term)}&utm_source=topsearches&utm_medium=chips&utm_campaign=homepage`;
        chip.className = 'btn btn-sm';
        chip.textContent = term;
        chip.style.cssText = 'background:var(--primary);color:white;padding:8px 16px;border-radius:20px;text-decoration:none;font-size:14px;';
        chips.appendChild(chip);
    });
    
    container.appendChild(chips);
    const hero = document.querySelector('.hero, .home-hero, main > section:first-child');
    if (hero) hero.parentNode.insertBefore(container, hero.nextSibling);
}

// NEW: Email share with prefill
function initEmailShare() {
    const emailBtn = document.createElement('button');
    emailBtn.innerHTML = '📧';
    emailBtn.title = 'Share via Email';
    emailBtn.style.cssText = 'width:50px;height:50px;border-radius:50%;background:#EA4335;color:white;border:none;font-size:20px;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.3);';
    emailBtn.onclick = () => {
        const url = window.location.href + '?utm_source=email&utm_medium=share&utm_campaign=email';
        const subject = encodeURIComponent('Check out this amazing tool!');
        const body = encodeURIComponent(`Hey! I found this awesome tool that you might like: ${url}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        if (window.gtag) gtag('event', 'share', { method: 'email' });
    };
    
    const shareContainer = document.querySelector('.social-share-float');
    if (shareContainer) shareContainer.appendChild(emailBtn);
}

// Initialize new growth features
document.addEventListener('DOMContentLoaded', () => {
    initSocialShare();
    initTopSearches();
    initEmailShare();
    initReferralSystem();
    initExitIntentPopup();
    initViralLoop();
});

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.nav-links');
    if (nav && !nav.querySelector('a[href="/tools/ai-chat.html"]')) {
        const link = document.createElement('a');
        link.href = '/tools/ai-chat.html';
        link.textContent = 'AI Chat';
        nav.insertBefore(link, nav.querySelector('a[href="/about.html"]'));
    }
});

// Call init functions since scripts are loaded after DOMContentLoaded
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
