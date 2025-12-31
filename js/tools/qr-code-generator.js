document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const sizeInput = document.getElementById('qr-size');
    const colorInput = document.getElementById('qr-color');
    const bgInput = document.getElementById('qr-bg');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const qrContainer = document.getElementById('qr-code');
    
    // Tab Elements
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Input Elements
    const urlInput = document.getElementById('qr-url-input');
    const textInput = document.getElementById('qr-text-input');
    const simpleText = document.getElementById('qr-text');
    
    const emailTo = document.getElementById('qr-email-to');
    const emailSubject = document.getElementById('qr-email-subject');
    const emailBody = document.getElementById('qr-email-body');
    
    const wifiSsid = document.getElementById('qr-wifi-ssid');
    const wifiPassword = document.getElementById('qr-wifi-password');
    const wifiType = document.getElementById('qr-wifi-type');

    let currentTab = 'url';
    if (!urlInput && !textInput && simpleText) {
        currentTab = 'simple';
    }
    let qrCode = null;

    // Tab Switching Logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update Tab UI
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.borderBottom = 'none';
                t.style.color = 'var(--text-muted)';
            });
            tab.classList.add('active');
            tab.style.borderBottom = '2px solid var(--accent-blue)';
            tab.style.color = 'var(--text-main)';
            
            // Show Content
            currentTab = tab.dataset.tab;
            tabContents.forEach(content => content.style.display = 'none');
            document.getElementById(`tab-content-${currentTab}`).style.display = 'block';
        });
    });

    function getQRData() {
        // Fallback simple mode (single input field)
        if (!urlInput && !textInput && !emailTo && !wifiSsid) {
            return (simpleText && simpleText.value.trim()) || 'https://quicknova.com';
        }
        switch(currentTab) {
            case 'url':
                return (urlInput && urlInput.value.trim()) || 'https://quicknova.com';
            case 'text':
                return (textInput && textInput.value.trim()) || 'QuickNova QR Code';
            case 'email':
                const to = (emailTo && emailTo.value.trim()) || '';
                const sub = encodeURIComponent((emailSubject && emailSubject.value.trim()) || '');
                const body = encodeURIComponent((emailBody && emailBody.value.trim()) || '');
                if (!to) return '';
                return `mailto:${to}?subject=${sub}&body=${body}`;
            case 'wifi':
                const ssid = (wifiSsid && wifiSsid.value.trim()) || '';
                const pass = (wifiPassword && wifiPassword.value.trim()) || '';
                const type = (wifiType && wifiType.value) || 'WPA';
                if (!ssid) return '';
                return `WIFI:S:${ssid};T:${type};P:${pass};;`;
            default:
                return 'https://quicknova.com';
        }
    }

    function generateQR() {
        const text = getQRData();
        if (!text) {
            alert('Please fill in the required fields.');
            return;
        }

        qrContainer.innerHTML = ''; // Clear previous

        try {
            // Prefer local library if available
            if (typeof QRCode !== 'undefined' && QRCode && QRCode.CorrectLevel) {
                qrCode = new QRCode(qrContainer, {
                    text: text,
                    width: parseInt(sizeInput.value),
                    height: parseInt(sizeInput.value),
                    colorDark: colorInput.value,
                    colorLight: bgInput.value,
                    correctLevel: QRCode.CorrectLevel.H
                });
            } else {
                // Fallback to remote API if library not loaded
                const size = parseInt(sizeInput.value);
                const c = (colorInput.value || '#000000').replace('#', '');
                const bg = (bgInput.value || '#ffffff').replace('#', '');
                const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${c}&bgcolor=${bg}`;
                const img = new Image();
                img.alt = 'QR Code';
                img.onload = () => {
                    qrContainer.appendChild(img);
                };
                img.onerror = () => {
                    qrContainer.innerHTML = '<span style="color: var(--error)">Failed to load QR image.</span>';
                };
                img.src = url;
            }
        } catch (e) {
            console.error('QR Generation Error:', e);
            // Fallback message with visible contrast
            qrContainer.innerHTML = '<span style="color: var(--error)">Error generating QR Code. Please check input.</span>';
        }
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', generateQR);
    }

    // Generate on load with default
    generateQR();

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            triggerConfetti();
            const img = qrContainer.querySelector('img');
            if (img && img.src) {
                const a = document.createElement('a');
                a.href = img.src;
                a.download = `qrcode-${currentTab}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                // Sometimes qrcodejs renders canvas instead of img immediately
                const canvas = qrContainer.querySelector('canvas');
                if (canvas) {
                    const a = document.createElement('a');
                    a.href = canvas.toDataURL("image/png");
                    a.download = `qrcode-${currentTab}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            }
        });
    }
});
