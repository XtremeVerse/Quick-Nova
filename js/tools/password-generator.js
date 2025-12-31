document.addEventListener('DOMContentLoaded', () => {
    // Output
    const output = document.getElementById('password-output');
    const copyBtn = document.getElementById('copy-btn');
    const refreshBtn = document.getElementById('refresh-btn');

    // Modes
    const modeRadios = document.getElementsByName('pwd-mode');
    const optionsRandom = document.getElementById('options-random');
    const optionsPin = document.getElementById('options-pin');
    const optionsMemorable = document.getElementById('options-memorable');

    // Random Options
    const lengthRange = document.getElementById('length-range');
    const lengthVal = document.getElementById('length-val');
    const incUpper = document.getElementById('inc-upper');
    const incLower = document.getElementById('inc-lower');
    const incNumbers = document.getElementById('inc-numbers');
    const incSymbols = document.getElementById('inc-symbols');

    // PIN Options
    const pinLengthRange = document.getElementById('pin-length-range');
    const pinLengthVal = document.getElementById('pin-length-val');

    // Memorable Options
    const wordCountRange = document.getElementById('word-count-range');
    const wordCountVal = document.getElementById('word-count-val');
    const capitalize = document.getElementById('capitalize');

    // Dictionary for Memorable Passwords (approx 200 common words)
    const words = [
        "apple", "beach", "cloud", "dance", "eagle", "flame", "grape", "house", "image", "juice",
        "kite", "lemon", "mango", "night", "ocean", "piano", "queen", "river", "snake", "tiger",
        "umbrella", "violin", "water", "xylophone", "yacht", "zebra", "amber", "brave", "crisp",
        "dawn", "elite", "frost", "glow", "hazel", "iris", "jade", "knack", "lunar", "mist", "noble",
        "orbit", "plush", "quest", "ruby", "solar", "tidal", "urban", "vivid", "wisp", "zenith",
        "anchor", "bridge", "cabin", "delta", "entry", "flora", "grove", "haven", "inlet", "jolly",
        "karma", "laser", "marsh", "nexus", "oasis", "pilot", "quill", "radar", "sable", "torch",
        "unity", "vault", "wharf", "xenon", "yield", "zest", "acorn", "bison", "cedar", "dune",
        "echo", "fable", "gecko", "heron", "ivory", "jazz", "koala", "lotus", "maple", "neon",
        "opal", "pine", "quartz", "reef", "sage", "topaz", "ultra", "viper", "wolf", "yawn",
        "zero", "alpha", "beta", "gamma", "delta", "helix", "ion", "juno", "kelp", "lava",
        "magma", "nova", "omega", "pulse", "quark", "ray", "spark", "terra", "unit", "vector",
        "warp", "xray", "yoga", "zone", "blue", "red", "green", "gold", "pink", "black", "white",
        "swift", "calm", "wild", "fast", "slow", "loud", "soft", "hard", "easy", "cool", "hot",
        "happy", "lucky", "smart", "kind", "fresh", "clean", "bright", "dark", "deep", "high"
    ];

    const chars = {
        upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lower: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
    };

    let currentMode = 'random';

    // Switch Mode Logic
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentMode = e.target.value;
            
            // Hide all options
            optionsRandom.style.display = 'none';
            optionsPin.style.display = 'none';
            optionsMemorable.style.display = 'none';

            // Show selected options
            if (currentMode === 'random') optionsRandom.style.display = 'block';
            else if (currentMode === 'pin') optionsPin.style.display = 'block';
            else if (currentMode === 'memorable') optionsMemorable.style.display = 'block';

            generate();
        });
    });

    function generateRandom() {
        let length = lengthRange.value;
        let charset = '';
        if (incUpper.checked) charset += chars.upper;
        if (incLower.checked) charset += chars.lower;
        if (incNumbers.checked) charset += chars.numbers;
        if (incSymbols.checked) charset += chars.symbols;

        if (charset === '') return 'Select options';

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    }

    function generatePIN() {
        let length = pinLengthRange.value;
        let pin = '';
        for (let i = 0; i < length; i++) {
            pin += Math.floor(Math.random() * 10);
        }
        return pin;
    }

    function generateMemorable() {
        let count = wordCountRange.value;
        let result = [];
        for (let i = 0; i < count; i++) {
            let word = words[Math.floor(Math.random() * words.length)];
            if (capitalize.checked) {
                word = word.charAt(0).toUpperCase() + word.slice(1);
            }
            result.push(word);
        }
        return result.join('-');
    }

    function generate() {
        let result = '';
        if (currentMode === 'random') result = generateRandom();
        else if (currentMode === 'pin') result = generatePIN();
        else if (currentMode === 'memorable') result = generateMemorable();
        
        output.value = result;
    }

    // Event Listeners
    lengthRange.addEventListener('input', () => {
        lengthVal.textContent = lengthRange.value;
        generate();
    });

    [incUpper, incLower, incNumbers, incSymbols].forEach(el => {
        el.addEventListener('change', generate);
    });

    pinLengthRange.addEventListener('input', () => {
        pinLengthVal.textContent = pinLengthRange.value;
        generate();
    });

    wordCountRange.addEventListener('input', () => {
        wordCountVal.textContent = wordCountRange.value;
        generate();
    });

    capitalize.addEventListener('change', generate);

    refreshBtn.addEventListener('click', generate);
    
    copyBtn.addEventListener('click', () => {
        if (output.value && output.value !== 'Select options') {
            copyToClipboard(output.value);
            triggerConfetti();
            
            // Visual feedback
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅';
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 1500);
        }
    });

    // Init
    generate();
});
