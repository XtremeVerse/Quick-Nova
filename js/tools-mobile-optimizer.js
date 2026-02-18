/**
 * Mobile Optimizer for All Tools
 * Automatically improves mobile UX across all tool pages
 * Runs on every tool page load
 */

document.addEventListener('DOMContentLoaded', () => {
    optimizeToolsForMobile();
});

function optimizeToolsForMobile() {
    if (!isMobileDevice()) return;
    
    // 1. Optimize layout for mobile
    optimizeLayout();
    
    // 2. Enhance touch targets
    enhanceTouchTargets();
    
    // 3. Improve input fields
    improveInputFields();
    
    // 4. Add smart shortcuts
    addSmartShortcuts();
    
    // 5. Optimize file uploads
    optimizeFileHandling();
    
    // 6. Add floating action buttons
    addFloatingActionButtons();
    
    // 7. Improve keyboard experience
    improveKeyboardExperience();
    
    // 8. Add context-aware hints
    addContextHints();
}

function isMobileDevice() {
    return window.innerWidth <= 768;
}

/**
 * 1. Layout Optimization
 */
function optimizeLayout() {
    const container = document.querySelector('.tool-container, .tool-workspace, main');
    if (!container) return;
    
    // Make main container full-width with safe margins
    container.style.cssText = `
        width: 100%;
        max-width: 100%;
        padding-left: 1rem;
        padding-right: 1rem;
        margin: 0 auto;
    `;
    
    // Optimize flex containers
    document.querySelectorAll('.tool-container > *, [class*="wrapper"], [class*="section"]').forEach(el => {
        if (window.getComputedStyle(el).display === 'grid') {
            el.style.gridTemplateColumns = '1fr';
            el.style.gap = '1rem';
        }
    });
    
    // Adjust heading sizes
    const h1 = document.querySelector('.tool-container h1, main h1');
    if (h1) {
        h1.style.fontSize = 'clamp(1.5rem, 5vw, 2rem)';
        h1.style.marginBottom = '0.5rem';
    }
    
    // Adjust content spacing
    document.querySelectorAll('.tool-container > *, main > section').forEach(section => {
        if (section.getAttribute('style')) {
            const marginTop = section.style.marginTop || '1rem';
            const marginBottom = section.style.marginBottom || '1rem';
            section.style.marginTop = 'clamp(0.5rem, 3vw, ' + marginTop + ')';
            section.style.marginBottom = 'clamp(0.5rem, 3vw, ' + marginBottom + ')';
        }
    });
}

/**
 * 2. Enhance Touch Targets
 */
function enhanceTouchTargets() {
    // Make all interactive elements at least 44x44px (iOS standard)
    const interactiveElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"]');
    
    interactiveElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const height = parseFloat(styles.height);
        const padding = parseFloat(styles.padding) || 8;
        
        if (height < 44) {
            el.style.minHeight = '44px';
            el.style.minWidth = '44px';
            el.style.padding = '0.75rem 1rem';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
        }
    });
    
    // Add spacing between buttons
    const buttonContainers = document.querySelectorAll('[class*="button"], [class*="action"]');
    buttonContainers.forEach(container => {
        const buttons = container.querySelectorAll('button, a.btn');
        if (buttons.length > 1) {
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '0.75rem';
            buttons.forEach(btn => {
                btn.style.width = '100%';
            });
        }
    });
}

/**
 * 3. Improve Input Fields
 */
function improveInputFields() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Increase tap area
        input.style.minHeight = '44px';
        input.style.padding = '0.875rem';
        input.style.fontSize = '16px'; // Prevents zoom on iOS
        input.style.borderRadius = '8px';
        input.style.border = '1px solid var(--border-subtle)';
        
        // Make inputs full-width on mobile
        if (input.parentElement) {
            input.style.width = '100%';
        }
        
        // Add focus styling
        input.addEventListener('focus', () => {
            input.style.outline = 'none';
            input.style.borderColor = 'var(--accent-blue)';
            input.style.boxShadow = '0 0 0 3px rgba(0, 112, 243, 0.1)';
        });
        
        input.addEventListener('blur', () => {
            input.style.borderColor = 'var(--border-subtle)';
            input.style.boxShadow = 'none';
        });
    });
    
    // Optimize text areas specifically
    document.querySelectorAll('textarea').forEach(ta => {
        ta.style.minHeight = '120px';
        ta.style.resize = 'vertical';
    });
}

/**
 * 4. Add Smart Shortcuts
 */
function addSmartShortcuts() {
    // Add keyboard shortcut hints
    const shortcutContainer = document.createElement('div');
    shortcutContainer.className = 'mobile-shortcuts';
    shortcutContainer.style.cssText = `
        display: none;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--bg-elevated);
        border-top: 1px solid var(--border-subtle);
        padding: 0.75rem;
        z-index: 500;
        grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
        gap: 0.5rem;
    `;
    
    // Add to body
    document.body.appendChild(shortcutContainer);
    
    // Show on input focus
    document.addEventListener('focus', (e) => {
        if (e.target.matches('input, textarea, select')) {
            shortcutContainer.style.display = 'grid';
        }
    }, true);
    
    // Hide on blur
    document.addEventListener('blur', (e) => {
        if (e.target.matches('input, textarea, select')) {
            setTimeout(() => {
                if (document.activeElement && !document.activeElement.matches('input, textarea, select')) {
                    shortcutContainer.style.display = 'none';
                }
            }, 100);
        }
    }, true);
}

/**
 * 5. Optimize File Handling
 */
function optimizeFileHandling() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        // Hide default file input
        input.style.display = 'none';
        
        // Create custom upload area
        const uploadArea = document.createElement('div');
        uploadArea.className = 'file-upload-custom';
        uploadArea.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            min-height: 120px;
            padding: 1.5rem;
            border: 2px dashed var(--border-subtle);
            border-radius: 12px;
            background: var(--bg);
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
        `;
        
        uploadArea.innerHTML = `
            <div style="font-size: 2rem;">📁</div>
            <div style="text-align: center;">
                <div style="font-weight: 500; margin-bottom: 0.25rem;">Tap to Upload</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">or drag & drop</div>
            </div>
        `;
        
        // Hover effects
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--accent-blue)';
            uploadArea.style.background = 'rgba(0, 112, 243, 0.05)';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border-subtle)';
            uploadArea.style.background = 'var(--bg)';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-subtle)';
            uploadArea.style.background = 'var(--bg)';
            
            if (e.dataTransfer.files.length > 0) {
                input.files = e.dataTransfer.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        
        uploadArea.addEventListener('click', () => {
            input.click();
        });
        
        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                uploadArea.innerHTML = `
                    <div style="font-size: 1.5rem;">✓</div>
                    <div style="text-align: center;">
                        <div style="font-weight: 500; color: var(--accent-blue);">${input.files[0].name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">${formatFileSize(input.files[0].size)}</div>
                    </div>
                `;
                uploadArea.style.borderColor = 'var(--accent-blue)';
                uploadArea.style.background = 'rgba(0, 112, 243, 0.05)';
            }
        });
        
        // Insert before input
        if (input.parentElement) {
            input.parentElement.insertBefore(uploadArea, input);
        }
    });
}

/**
 * 6. Add Floating Action Buttons
 */
function addFloatingActionButtons() {
    const fab = document.createElement('div');
    fab.className = 'fab-container';
    fab.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 400;
    `;
    
    // Scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '⬆️';
    scrollBtn.style.cssText = `
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--accent-blue);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        transition: all 0.3s ease;
    `;
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', () => {
        scrollBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
    });
    
    fab.appendChild(scrollBtn);
    document.body.appendChild(fab);
}

/**
 * 7. Improve Keyboard Experience
 */
function improveKeyboardExperience() {
    // Add Enter key support for main actions
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            // Ctrl+Enter to submit primary action
            const primaryBtn = document.querySelector('button[class*="primary"], button[class*="submit"], .btn-primary');
            if (primaryBtn) primaryBtn.click();
        }
        
        if (e.key === 'Escape') {
            // Escape to close modals/dropdowns
            const modal = document.querySelector('[class*="modal"].active, [class*="dropdown"].active');
            if (modal) modal.classList.remove('active');
        }
    });
}

/**
 * 8. Add Context-Aware Hints
 */
function addContextHints() {
    // Add helpful hints for common tool patterns
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach((input, index) => {
        if (input.placeholder && !input.title) {
            input.title = input.placeholder;
        }
        
        // Add character counter for textarea
        if (input.tagName === 'TEXTAREA' && !input.nextElementSibling?.classList.contains('char-count')) {
            const counter = document.createElement('div');
            counter.className = 'char-count';
            counter.style.cssText = `
                font-size: 0.85rem;
                color: var(--text-muted);
                margin-top: 0.25rem;
                text-align: right;
            `;
            input.parentElement.insertBefore(counter, input.nextSibling);
            
            input.addEventListener('input', () => {
                const maxLength = input.maxLength === -1 ? '∞' : input.maxLength;
                counter.textContent = `${input.value.length}${maxLength !== '∞' ? ' / ' + maxLength : ''} characters`;
            });
            
            // Trigger initial count
            input.dispatchEvent(new Event('input'));
        }
    });
}

/**
 * Utility Functions
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Export for use in other scripts if needed
window.ToolsMobileOptimizer = {
    optimize: optimizeToolsForMobile,
    isMobileDevice: isMobileDevice
};
