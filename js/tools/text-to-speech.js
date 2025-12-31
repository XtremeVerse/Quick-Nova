document.addEventListener('DOMContentLoaded', () => {
    const synth = window.speechSynthesis;
    const textInput = document.getElementById('text-input');
    const voiceSelect = document.getElementById('voice-select');
    const rateInput = document.getElementById('rate');
    const pitchInput = document.getElementById('pitch');
    const speakBtn = document.getElementById('speak-btn');
    const stopBtn = document.getElementById('stop-btn');
    
    let voices = [];

    function populateVoices() {
        voices = synth.getVoices().sort(function (a, b) {
            const aname = a.name.toUpperCase();
            const bname = b.name.toUpperCase();
            if (aname < bname) return -1;
            else if (aname == bname) return 0;
            else return +1;
        });

        voiceSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Select Voice...';
        defaultOption.value = '';
        voiceSelect.appendChild(defaultOption);

        for (let i = 0; i < voices.length; i++) {
            const option = document.createElement('option');
            option.textContent = `${voices[i].name} (${voices[i].lang})`;

            if (voices[i].default) {
                option.textContent += ' -- DEFAULT';
            }

            option.setAttribute('data-lang', voices[i].lang);
            option.setAttribute('data-name', voices[i].name);
            voiceSelect.appendChild(option);
        }
    }

    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }

    function speak() {
        if (synth.speaking) {
            console.error('speechSynthesis.speaking');
            return;
        }

        if (textInput.value !== '') {
            const utterThis = new SpeechSynthesisUtterance(textInput.value);
            
            utterThis.onend = function (event) {
                console.log('SpeechSynthesisUtterance.onend');
            };
            
            utterThis.onerror = function (event) {
                console.error('SpeechSynthesisUtterance.onerror');
            };

            const selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
            
            for (let i = 0; i < voices.length; i++) {
                if (voices[i].name === selectedOption) {
                    utterThis.voice = voices[i];
                    break;
                }
            }
            
            utterThis.pitch = pitchInput.value;
            utterThis.rate = rateInput.value;
            
            synth.speak(utterThis);
        }
    }

    speakBtn.addEventListener('click', (e) => {
        e.preventDefault();
        speak();
    });

    stopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        synth.cancel();
    });

    rateInput.addEventListener('change', () => {
        rateInput.nextElementSibling.textContent = rateInput.value + 'x';
    });
    
    pitchInput.addEventListener('change', () => {
        pitchInput.nextElementSibling.textContent = pitchInput.value;
    });
});
