document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENT SELECTORS ---
    const synthesizeButton = document.getElementById('synthesize-button');
    const playbackButton = document.getElementById('playback-button');
    const textInput = document.getElementById('text-input');
    const audioPlayback = document.createElement('audio');
    
    // Other selectors...
    const layers = document.querySelectorAll('.layer');
    const bootSequence = document.getElementById('boot-sequence');
    const bootText = document.getElementById('boot-text');
    const progressBar = document.getElementById('progress-bar');
    const notificationBar = document.getElementById('notification-bar');
    const clockEl = document.getElementById('clock');
    const cpuLoadEl = document.getElementById('cpu-load');
    const heartRateEl = document.getElementById('heart-rate');
    const powerLevelEl = document.getElementById('power-level');

    // --- STATE MANAGEMENT ---
    let lastAudioUrl = null;

    // --- INITIALIZATION ---
    playbackButton.disabled = true;
    setInterval(updateLiveStats, 2000);
    updateLiveStats();
    initInteractiveAnimations();
    runBootSequence();
    initParallax();

    // --- CORE FUNCTIONS ---

    function runBootSequence() {
        const tl = anime.timeline({
            easing: 'easeOutExpo',
        });
        
        tl.add({
            targets: '#boot-text',
            opacity: [0, 1],
            duration: 1000,
        })
        .add({
            targets: '#progress-bar',
            width: '100%',
            duration: 2000,
            changeComplete: () => {
                bootText.textContent = 'SYSTEMS ONLINE';
            }
        })
        .add({
            targets: '#boot-sequence',
            opacity: 0,
            duration: 500,
            complete: () => {
                bootSequence.style.display = 'none';
                initHUD();
            }
        }, '+=500');
    }
    
    function initHUD() {
        const hudTl = anime.timeline({
            easing: 'easeOutExpo',
        });
        
        hudTl.add({
            targets: '.corner',
            opacity: [0, 1],
            scale: [0.5, 1],
            duration: 800,
            delay: anime.stagger(100)
        })
        .add({
            targets: '.hud-widget',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 1000,
            delay: anime.stagger(150, {start: 300})
        }, '-=800')
        .add({
            targets: '#scanner-tl circle, #scanner-br circle',
            strokeDasharray: ['0 1000', '1000 0'],
            duration: 3000,
            loop: true,
            direction: 'alternate',
            easing: 'easeInOutSine',
            delay: anime.stagger(200)
        }, '-=2000')
        .add({
            targets: '#targeting-reticle .ring',
            rotate: '1turn',
            duration: 10000,
            loop: true,
            easing: 'linear'
        }, 0);
    }

    function updateLiveStats() {
        clockEl.textContent = new Date().toLocaleTimeString('en-GB');
        cpuLoadEl.textContent = `${Math.floor(Math.random() * 20 + 10)}%`;
        heartRateEl.textContent = `${Math.floor(Math.random() * 10 + 68)} BPM`;
        powerLevelEl.textContent = `${(98 - Math.random() * 5).toFixed(1)}%`;
    }

    function showAlert(message, isError = false) {
        notificationBar.textContent = message;
        notificationBar.setAttribute('data-text', message);
        notificationBar.classList.toggle('error', isError);

        anime({
            targets: '#notification-bar',
            opacity: [0, 1],
            translateY: [-20, 0],
            duration: 500,
            complete: () => {
                if(isError) notificationBar.classList.add('glitch');
                
                setTimeout(() => {
                    anime({
                        targets: '#notification-bar',
                        opacity: 0,
                        translateY: [0, -20],
                        duration: 500,
                        complete: () => notificationBar.classList.remove('glitch', 'error')
                    });
                }, 3000);
            }
        });
    }

    async function handleSynthesis() {
        const text = textInput.value.trim();
        if (!text) {
            showAlert('NO INPUT DETECTED', true);
            return;
        }

        synthesizeButton.disabled = true;
        playbackButton.disabled = true;
        anime({ targets: synthesizeButton, innerText: "PROCESSING...", duration: 300, easing: 'easeOutExpo' });

        try {
            const response = await fetch('/generate-voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'API request failed');
            }

            const data = await response.json();
            const audioUrl = data.audio_url;

            if (audioUrl) {
                showAlert('SYNTHESIS COMPLETE. PLAYING AUDIO.');
                lastAudioUrl = audioUrl;
                audioPlayback.src = audioUrl;
                audioPlayback.play();
            } else {
                throw new Error('Audio URL not found in response.');
            }

        } catch (error) {
            console.error('Error:', error);
            showAlert(error.message, true);
        } finally {
            synthesizeButton.disabled = false;
            if (lastAudioUrl) playbackButton.disabled = false;
            anime({ targets: synthesizeButton, innerText: "SYNTHESIZE", duration: 300, easing: 'easeOutExpo' });
        }
    }

    function handlePlayback() {
        if (lastAudioUrl) {
            showAlert('PLAYING LAST SYNTHESIS.');
            audioPlayback.src = lastAudioUrl;
            audioPlayback.play();
        } else {
            showAlert('NO AUDIO AVAILABLE FOR PLAYBACK.', true);
        }
    }

    function initInteractiveAnimations() {
        synthesizeButton.addEventListener('click', handleSynthesis);
        playbackButton.addEventListener('click', handlePlayback);

        [synthesizeButton, playbackButton].forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                if(e.target.disabled) return;
                anime({ targets: e.target, scale: 1.05, boxShadow: `0 0 15px var(--hud-glow)`, duration: 200 });
            });
            button.addEventListener('mouseleave', (e) => {
                if(e.target.disabled) return;
                anime({ targets: e.target, scale: 1, boxShadow: `0 0 0px var(--hud-glow)`, duration: 300 });
            });
        });
        
        textInput.addEventListener('focus', () => {
           anime({ targets: textInput, borderColor: 'var(--secondary-glow)', boxShadow: '0 0 15px var(--hud-glow)', duration: 300 });
        });
        textInput.addEventListener('blur', () => {
            anime({ targets: textInput, borderColor: 'var(--hud-blue)', boxShadow: '0 0 0px var(--hud-glow)', duration: 300 });
        });
    }
    
    function initParallax() {
        window.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const moveX = ((clientX - innerWidth / 2) / (innerWidth / 2)) * -1;
            const moveY = ((clientY - innerHeight / 2) / (innerHeight / 2)) * -1;

            layers.forEach(layer => {
                const depth = layer.getAttribute('data-depth');
                layer.style.transform = `translateX(${moveX * depth * 20}px) translateY(${moveY * depth * 20}px)`;
            });
        });
    }
});