document.addEventListener('DOMContentLoaded', () => {
    const recordBtn = document.getElementById('record-btn');
    const stopBtn = document.getElementById('stop-btn');
    const timerDisplay = document.getElementById('timer');
    const recordingsList = document.getElementById('recordings-list');
    const visualizer = document.getElementById('visualizer');

    let mediaRecorder;
    let chunks = [];
    let startTime;
    let timerInterval;
    let audioContext;
    let analyser;
    let dataArray;
    let animationId;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Supported
    } else {
        alert('Your browser does not support audio recording.');
        return;
    }

    recordBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);

    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                
                mediaRecorder.ondataavailable = (e) => {
                    chunks.push(e.data);
                };

                mediaRecorder.onstop = (e) => {
                    const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
                    chunks = [];
                    const audioURL = window.URL.createObjectURL(blob);
                    createRecordingElement(audioURL);
                    
                    // Stop visualization
                    cancelAnimationFrame(animationId);
                    visualizer.innerHTML = '<span style="color: var(--text-muted);">Waveform Visualization</span>';
                    
                    // Stop tracks to release mic
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                
                // UI Updates
                recordBtn.disabled = true;
                stopBtn.disabled = false;
                recordBtn.style.opacity = '0.5';
                
                // Timer
                startTime = Date.now();
                timerInterval = setInterval(updateTimer, 1000);

                // Visualization
                visualize(stream);
            })
            .catch(err => {
                console.error('The following error occurred: ' + err);
                alert('Could not access microphone.');
            });
    }

    function stopRecording() {
        mediaRecorder.stop();
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        recordBtn.style.opacity = '1';
        
        clearInterval(timerInterval);
        timerDisplay.textContent = '00:00';
    }

    function updateTimer() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;
    }

    function createRecordingElement(url) {
        const div = document.createElement('div');
        div.className = 'glass';
        div.style.padding = '1rem';
        div.style.borderRadius = '8px';
        div.style.marginBottom = '1rem';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '1rem';

        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = url;
        audio.style.flexGrow = '1';

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `recording_${new Date().getTime()}.ogg`;
        downloadLink.className = 'btn btn-secondary btn-sm';
        downloadLink.textContent = 'Download';

        div.appendChild(audio);
        div.appendChild(downloadLink);
        recordingsList.prepend(div);
    }

    function visualize(stream) {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        source.connect(analyser);
        
        visualizer.innerHTML = ''; // Clear text
        const canvas = document.createElement('canvas');
        canvas.width = visualizer.clientWidth;
        canvas.height = visualizer.clientHeight;
        visualizer.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        function draw() {
            animationId = requestAnimationFrame(draw);
            
            analyser.getByteTimeDomainData(dataArray);
            
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-elevated');
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--accent-blue');
            ctx.beginPath();
            
            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;
            
            for(let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;
                
                if(i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            ctx.lineTo(canvas.width, canvas.height/2);
            ctx.stroke();
        }
        
        draw();
    }
});
