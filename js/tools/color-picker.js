document.addEventListener('DOMContentLoaded', () => {
    const colorInput = document.getElementById('color-input');
    const hexInput = document.getElementById('hex-value');
    const rgbInput = document.getElementById('rgb-value');
    const hslInput = document.getElementById('hsl-value');
    const paletteContainer = document.getElementById('palette');
    const copyBtns = document.querySelectorAll('.copy-btn');

    function updateColor(hex) {
        // Update input if not triggered by it (optional check, but setting value is safe)
        if (colorInput.value !== hex) {
            colorInput.value = hex;
        }

        hexInput.value = hex;

        const rgb = hexToRgb(hex);
        rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

        generatePalette(hsl.h, hsl.s);
    }

    // Converters
    function hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    function generatePalette(h, s) {
        paletteContainer.innerHTML = '';
        for (let l = 10; l <= 95; l += 10) {
            const hex = hslToHex(h, s, l);
            const div = document.createElement('div');
            div.style.backgroundColor = hex;
            div.style.height = '80px';
            div.style.borderRadius = '8px';
            div.style.cursor = 'pointer';
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            div.style.boxShadow = 'var(--shadow-soft)';
            div.title = hex;
            
            // Text color based on lightness
            div.style.color = l > 50 ? '#000' : '#fff';
            div.innerHTML = `<span style="font-size: 0.8rem; opacity: 0;">${hex}</span>`;
            
            // Hover effect
            div.addEventListener('mouseenter', () => div.querySelector('span').style.opacity = '1');
            div.addEventListener('mouseleave', () => div.querySelector('span').style.opacity = '0');

            div.addEventListener('click', () => {
                updateColor(hex);
                // Also copy to clipboard
                navigator.clipboard.writeText(hex);
                // Maybe show a toast or feedback
            });

            paletteContainer.appendChild(div);
        }
    }

    // Event Listeners
    colorInput.addEventListener('input', (e) => updateColor(e.target.value));

    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            if (input) {
                input.select();
                navigator.clipboard.writeText(input.value).then(() => {
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied!';
                    setTimeout(() => btn.textContent = originalText, 2000);
                });
            }
        });
    });

    // Initial Load
    updateColor(colorInput.value);
});
