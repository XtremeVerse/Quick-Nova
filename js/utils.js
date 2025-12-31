// Utility functions for tools

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(err => {
        showToast('Failed to copy', 'error');
        console.error('Could not copy text: ', err);
    });
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showToast(message, type = 'info') {
    // Simple toast implementation
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.padding = '1rem 2rem';
        toast.style.borderRadius = '8px';
        toast.style.color = 'white';
        toast.style.zIndex = '2000';
        toast.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(toast);
    }
    
    toast.style.backgroundColor = type === 'success' ? 'var(--success)' : 
                                 type === 'error' ? 'var(--error)' : 'var(--accent-blue)';
    toast.textContent = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// Helper to simulate loading
function simulateLoading(button, duration = 1500) {
    const originalText = button.textContent;
    button.textContent = 'Processing...';
    button.disabled = true;
    button.style.opacity = '0.7';
    
    return new Promise(resolve => {
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            button.style.opacity = '1';
            resolve();
        }, duration);
    });
}

function triggerConfetti() {
    const colors = ['#0070f3', '#7928ca', '#f5a623', '#ff0080', '#00dfd8'];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const p = document.createElement('div');
        p.style.position = 'fixed';
        p.style.left = '50%';
        p.style.top = '50%';
        p.style.width = '8px';
        p.style.height = '8px';
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = '50%';
        p.style.zIndex = '9999';
        p.style.pointerEvents = 'none';
        document.body.appendChild(p);

        const angle = Math.random() * Math.PI * 2;
        const velocity = 5 + Math.random() * 5;
        const tx = Math.cos(angle) * velocity * 20;
        const ty = Math.sin(angle) * velocity * 20;

        const animation = p.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
        ], {
            duration: 800 + Math.random() * 400,
            easing: 'cubic-bezier(0, .9, .57, 1)',
            fill: 'forwards'
        });

        animation.onfinish = () => p.remove();
    }
}
