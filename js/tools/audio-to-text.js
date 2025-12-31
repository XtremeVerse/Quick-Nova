document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('mic-btn');
    const statusText = document.getElementById('status-text');
    const transcriptArea = document.getElementById('transcript');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        statusText.innerHTML = '<span style="color: var(--error);">Your browser does not support Speech Recognition. Please use Chrome, Edge, or Safari.</span>';
        micBtn.disabled = true;
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let isListening = false;
    let finalTranscript = '';

    recognition.onstart = () => {
        isListening = true;
        statusText.textContent = 'Listening... Speak now';
        micBtn.classList.add('pulse'); // Need to add pulse animation in CSS or inline style if easier, but class is cleaner
        micBtn.style.background = 'var(--error)';
    };

    recognition.onend = () => {
        isListening = false;
        statusText.textContent = 'Click microphone to start speaking';
        micBtn.classList.remove('pulse');
        micBtn.style.background = 'var(--accent-blue)';
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        statusText.innerHTML = `<span style="color: var(--error);">Error: ${event.error}</span>`;
        isListening = false;
        micBtn.classList.remove('pulse');
        micBtn.style.background = 'var(--accent-blue)';
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        transcriptArea.value = finalTranscript + interimTranscript;
        transcriptArea.scrollTop = transcriptArea.scrollHeight;
    };

    micBtn.addEventListener('click', () => {
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });

    copyBtn.addEventListener('click', () => {
        if (transcriptArea.value) {
            navigator.clipboard.writeText(transcriptArea.value)
                .then(() => {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                    }, 2000);
                });
        }
    });

    clearBtn.addEventListener('click', () => {
        transcriptArea.value = '';
        finalTranscript = '';
        statusText.textContent = 'Click microphone to start speaking';
    });
});
