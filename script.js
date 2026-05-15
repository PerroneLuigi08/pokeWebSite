document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('pokemon-select');
    const display = document.getElementById('pokemon-display');
    const mapMarker = document.getElementById('map-marker');
    const mapNote = document.getElementById('map-note');

    const premiumLeftSelect = document.getElementById('premium-left-select');
    const premiumRightSelect = document.getElementById('premium-right-select');
    const createFightVideoButton = document.getElementById('create-fight-video');
    const premiumStatus = document.getElementById('premium-status');
    const fightCanvas = document.getElementById('fight-canvas');
    const fightVideo = document.getElementById('fight-video');
    const downloadVideo = document.getElementById('download-video');
    const fightCtx = fightCanvas.getContext('2d');

    const customCursor = document.createElement('div');
    customCursor.id = 'custom-cursor';
    document.body.appendChild(customCursor);

    let lastSparkTime = 0;

    function createSpark(x, y, vx = 0, vy = 0, speed = 0) {
        const now = performance.now();
        if (now - lastSparkTime < 25) {
            return;
        }
        lastSparkTime = now;

        const spark = document.createElement('div');
        spark.className = 'spark';
        const size = 8 + Math.min(10, speed / 4);
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;
        spark.style.left = `${x - size / 2}px`;
        spark.style.top = `${y - size / 2}px`;

        const dx = Math.round((Math.random() - 0.5) * 40 + vx * 0.6);
        const dy = Math.round((Math.random() - 0.5) * 40 + vy * 0.6);
        spark.style.setProperty('--dx', `${dx}px`);
        spark.style.setProperty('--dy', `${dy}px`);

        spark.style.filter = `blur(${Math.min(2, speed / 30)}px)`;
        document.body.appendChild(spark);
        window.setTimeout(() => spark.remove(), 850);
    }

    let lastX = 0;
    let lastY = 0;
    let lastTime = performance.now();

    document.addEventListener('mousemove', event => {
        const x = event.clientX;
        const y = event.clientY;
        const dx = x - lastX;
        const dy = y - lastY;

        customCursor.style.left = `${x}px`;
        customCursor.style.top = `${y}px`;
        customCursor.style.transform = `translate(-50%, -50%) scale(${Math.min(1.5, 1 + Math.hypot(dx, dy) / 100)})`;
        customCursor.style.background = `rgba(96, 165, 250, 0.18)`;

        const now = performance.now();
        const dt = Math.max(1, now - lastTime);
        const speed = Math.min(35, Math.hypot(dx, dy) / dt * 80);
        const hue = 210 + (x / window.innerWidth) * 70 + (y / window.innerHeight) * 30;
        document.documentElement.style.setProperty('--bg-hue', hue);

        createSpark(x, y, dx, dy, speed);
        lastX = x;
        lastY = y;
        lastTime = now;
    });

    document.addEventListener('mousedown', () => {
        customCursor.style.width = '34px';
        customCursor.style.height = '34px';
        customCursor.style.background = 'rgba(56, 189, 248, 0.24)';
    });

    document.addEventListener('mouseup', () => {
        customCursor.style.width = '24px';
        customCursor.style.height = '24px';
    });

    document.addEventListener('mouseenter', () => {
        customCursor.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        customCursor.style.opacity = '0';
    });

    async function loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.src = url;
            image.onload = () => resolve(image);
            image.onerror = reject;
        });
    }

    function updatePremiumStatus(message) {
        premiumStatus.textContent = message;
    }

    function drawArenaFrame(leftImage, rightImage, leftName, rightName, frame) {
        fightCtx.clearRect(0, 0, fightCanvas.width, fightCanvas.height);
        fightCtx.fillStyle = 'rgba(9, 22, 45, 0.9)';
        fightCtx.fillRect(0, 0, fightCanvas.width, fightCanvas.height);

        const gradient = fightCtx.createRadialGradient(320, 160, 20, 320, 160, 320);
        gradient.addColorStop(0, 'rgba(149, 173, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
        fightCtx.fillStyle = gradient;
        fightCtx.fillRect(0, 0, fightCanvas.width, fightCanvas.height);

        fightCtx.strokeStyle = 'rgba(148, 163, 184, .18)';
        fightCtx.lineWidth = 2;
        fightCtx.strokeRect(14, 14, fightCanvas.width - 28, fightCanvas.height - 28);

        const leftX = 120 + Math.sin(frame / 12) * 10;
        const rightX = 520 + Math.sin(frame / 14) * 10;
        const leftY = 160 + Math.cos(frame / 16) * 8;
        const rightY = 160 + Math.cos(frame / 16 + Math.PI) * 8;

        const leftSize = 140 + Math.sin(frame / 10) * 6;
        const rightSize = 140 - Math.sin(frame / 11) * 6;

        fightCtx.save();
        fightCtx.translate(leftX, leftY);
        fightCtx.drawImage(leftImage, -leftSize / 2, -leftSize / 2, leftSize, leftSize);
        fightCtx.restore();

        fightCtx.save();
        fightCtx.translate(rightX, rightY);
        fightCtx.scale(-1, 1);
        fightCtx.drawImage(rightImage, -rightSize / 2, -rightSize / 2, rightSize, rightSize);
        fightCtx.restore();

        fightCtx.fillStyle = '#f8fafc';
        fightCtx.font = 'bold 18px Segoe UI';
        fightCtx.textAlign = 'center';
        fightCtx.fillText(leftName, leftX, 40);
        fightCtx.fillText(rightName, rightX, 40);

        const leftHealth = Math.max(20, 100 - frame * 0.75);
        const rightHealth = Math.max(20, 100 - frame * 0.8);

        fightCtx.fillStyle = 'rgba(30, 64, 175, .2)';
        fightCtx.fillRect(90, 56, 180, 12);
        fightCtx.fillRect(490, 56, 180, 12);

        fightCtx.fillStyle = '#38bdf8';
        fightCtx.fillRect(90, 56, leftHealth * 1.8, 12);
        fightCtx.fillStyle = '#f472b6';
        fightCtx.fillRect(490, 56, rightHealth * 1.8, 12);

        fightCtx.strokeStyle = 'rgba(255,255,255,0.12)';
        fightCtx.strokeRect(90, 56, 180, 12);
        fightCtx.strokeRect(490, 56, 180, 12);

        if (frame % 40 < 20) {
            fightCtx.fillStyle = 'rgba(255,255,255,0.06)';
            fightCtx.beginPath();
            fightCtx.arc(260, 170, 42, 0, Math.PI * 2);
            fightCtx.fill();
        } else {
            fightCtx.fillStyle = 'rgba(248, 113, 113, 0.12)';
            fightCtx.beginPath();
            fightCtx.arc(380, 170, 42, 0, Math.PI * 2);
            fightCtx.fill();
        }
    }

    function animateBattle(leftImage, rightImage, leftName, rightName, duration = 4200) {
        return new Promise(resolve => {
            const startTime = performance.now();
            function step(now) {
                const elapsed = now - startTime;
                const frame = Math.floor(elapsed / 16);
                drawArenaFrame(leftImage, rightImage, leftName, rightName, frame);
                if (elapsed < duration) {
                    requestAnimationFrame(step);
                } else {
                    resolve();
                }
            }
            requestAnimationFrame(step);
        });
    }

    async function createFightVideo() {
        const leftUrl = premiumLeftSelect.value;
        const rightUrl = premiumRightSelect.value;

        if (!leftUrl || !rightUrl || leftUrl === rightUrl) {
            updatePremiumStatus('Choose two different fighters for the battle.');
            return;
        }

        updatePremiumStatus('Charging premium battlefield...');
        fightVideo.hidden = true;
        downloadVideo.hidden = true;
        fightCanvas.hidden = false;

        try {
            const [leftData, rightData] = await Promise.all([
                fetch(leftUrl).then(res => res.json()),
                fetch(rightUrl).then(res => res.json())
            ]);

            const leftSprite = leftData.sprites.front_default || leftData.sprites.other?.['official-artwork']?.front_default;
            const rightSprite = rightData.sprites.front_default || rightData.sprites.other?.['official-artwork']?.front_default;
            const [leftImage, rightImage] = await Promise.all([
                loadImage(leftSprite),
                loadImage(rightSprite)
            ]);

            updatePremiumStatus('Generating battle animation...');

            const canRecord = fightCanvas.captureStream && window.MediaRecorder;
            let recordedBlob = null;

            if (canRecord) {
                const stream = fightCanvas.captureStream(30);
                let chunks = [];
                let recorder;
                try {
                    recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
                } catch (_) {
                    recorder = new MediaRecorder(stream);
                }
                recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
                const recorderStopped = new Promise(resolve => recorder.onstop = resolve);
                recorder.start();
                await animateBattle(leftImage, rightImage, capitalize(leftData.name), capitalize(rightData.name));
                recorder.stop();
                await recorderStopped;
                recordedBlob = new Blob(chunks, { type: 'video/webm' });
            } else {
                await animateBattle(leftImage, rightImage, capitalize(leftData.name), capitalize(rightData.name));
            }

            if (recordedBlob) {
                const videoUrl = URL.createObjectURL(recordedBlob);
                fightVideo.src = videoUrl;
                fightVideo.hidden = false;
                fightVideo.play();
                downloadVideo.href = videoUrl;
                downloadVideo.hidden = false;
                updatePremiumStatus('Premium fight video ready! Play it or download the webm file.');
            } else {
                updatePremiumStatus('Video recording not supported. Animated preview is shown instead.');
            }
        } catch (error) {
            updatePremiumStatus('Could not create the fight video. Try again with different Pokémon.');
        }
    }

    createFightVideoButton.addEventListener('click', createFightVideo);

    const locationCoordinates = {
        'kanto-route-1-area': { x: 15, y: 68, label: 'Route 1' },
        'kanto-route-2-south-towards-viridian-city': { x: 22, y: 54, label: 'Route 2' },
        'kanto-route-2-north-towards-oceanview-motel': { x: 30, y: 46, label: 'Route 2 North' },
        'kanto-route-3-area': { x: 30, y: 40, label: 'Route 3' },
        'kanto-route-4-area': { x: 36, y: 30, label: 'Route 4' },
        'kanto-route-5-area': { x: 45, y: 28, label: 'Route 5' },
        'kanto-route-6-area': { x: 52, y: 30, label: 'Route 6' },
        'kanto-route-7-area': { x: 60, y: 27, label: 'Route 7' },
        'kanto-route-8-area': { x: 70, y: 28, label: 'Route 8' },
        'kanto-route-9-area': { x: 82, y: 30, label: 'Route 9' },
        'kanto-route-10-area': { x: 82, y: 45, label: 'Route 10' },
        'kanto-route-11-area': { x: 80, y: 55, label: 'Route 11' },
        'kanto-route-12-area': { x: 70, y: 60, label: 'Route 12' },
        'kanto-route-13-area': { x: 62, y: 62, label: 'Route 13' },
        'kanto-route-14-area': { x: 50, y: 72, label: 'Route 14' },
        'kanto-route-15-area': { x: 43, y: 76, label: 'Route 15' },
        'kanto-route-16-area': { x: 33, y: 82, label: 'Route 16' },
        'kanto-route-17-area': { x: 33, y: 91, label: 'Route 17' },
        'kanto-route-18-area': { x: 24, y: 84, label: 'Route 18' },
        'kanto-route-19-area': { x: 56, y: 75, label: 'Route 19' },
        'kanto-route-20-area': { x: 65, y: 77, label: 'Route 20' },
        'kanto-route-21-area': { x: 72, y: 72, label: 'Route 21' },
        'kanto-route-22-area': { x: 80, y: 70, label: 'Route 22' },
        'kanto-route-23-area': { x: 86, y: 58, label: 'Route 23' },
        'kanto-route-24-area': { x: 78, y: 45, label: 'Route 24' },
        'kanto-route-25-area': { x: 86, y: 52, label: 'Route 25' },
        'viridian-forest-area': { x: 18, y: 50, label: 'Viridian Forest' },
        'pallet-town-area': { x: 16, y: 68, label: 'Pallet Town' },
        'pewter-city-area': { x: 32, y: 33, label: 'Pewter City' },
        'cerulean-city-area': { x: 38, y: 36, label: 'Cerulean City' },
        'vermilion-city-area': { x: 58, y: 34, label: 'Vermilion City' },
        'lavender-town-area': { x: 58, y: 44, label: 'Lavender Town' },
        'saffron-city-area': { x: 48, y: 34, label: 'Saffron City' },
        'celadon-city-area': { x: 46, y: 32, label: 'Celadon City' },
        'seafoam-islands-area': { x: 69, y: 42, label: 'Seafoam Islands' },
        'rock-tunnel-area': { x: 39, y: 43, label: 'Rock Tunnel' },
        'mt-moon-area': { x: 30, y: 40, label: 'Mt. Moon' },
        'safari-zone-area': { x: 72, y: 52, label: 'Safari Zone' },
        'power-plant-area': { x: 72, y: 41, label: 'Power Plant' },
        'digletts-cave-area': { x: 24, y: 74, label: "Diglett's Cave" },
        'victory-road-area': { x: 48, y: 46, label: 'Victory Road' },
        'pokemon-tower-area': { x: 58, y: 45, label: 'Pokémon Tower' },
        'cerulean-cave-area': { x: 33, y: 36, label: 'Cerulean Cave' }
    };

    function capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function updateMapNote(message) {
        mapNote.textContent = message;
    }

    function hideMarker() {
        mapMarker.hidden = true;
        mapMarker.style.left = '0';
        mapMarker.style.top = '0';
    }

    function placeMarker(location) {
        mapMarker.hidden = false;
        mapMarker.style.left = `${location.x}%`;
        mapMarker.style.top = `${location.y}%`;
        updateMapNote(`Most likely found near ${location.label}.`);
    }

    function findLocation(encounters) {
        if (!Array.isArray(encounters) || encounters.length === 0) {
            return null;
        }

        const kantoMatch = encounters.find(encounter => {
            const name = encounter.location_area.name;
            return name.startsWith('kanto-') && locationCoordinates[name];
        });

        if (kantoMatch) {
            return locationCoordinates[kantoMatch.location_area.name];
        }

        const firstMapped = encounters
            .map(encounter => locationCoordinates[encounter.location_area.name])
            .find(Boolean);

        if (firstMapped) {
            return firstMapped;
        }

        const fallbackLabel = encounters[0].location_area.name.replace(/-/g, ' ');
        return { x: 50, y: 50, label: capitalize(fallbackLabel) };
    }

    function renderPokemonCard(pokemon, location) {
        const sprite = pokemon.sprites.front_default || pokemon.sprites.other?.['official-artwork']?.front_default || '';
        display.innerHTML = `
            <div class="pokemon-card">
                <img src="${sprite}" alt="${pokemon.name}" />
                <div>
                    <h2>${capitalize(pokemon.name)}</h2>
                    <p>Height: ${pokemon.height / 10} m · Weight: ${pokemon.weight / 10} kg</p>
                </div>
            </div>
        `;

        if (location) {
            placeMarker(location);
        } else {
            hideMarker();
            updateMapNote(`No mapped location found for ${capitalize(pokemon.name)}.`);
        }
    }

    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        .then(response => response.json())
        .then(data => {
            data.results.forEach(pokemon => {
                const option = document.createElement('option');
                option.value = pokemon.url;
                option.textContent = capitalize(pokemon.name);
                select.appendChild(option);

                const optionLeft = option.cloneNode(true);
                const optionRight = option.cloneNode(true);
                premiumLeftSelect.appendChild(optionLeft);
                premiumRightSelect.appendChild(optionRight);
            });
        })
        .catch(() => {
            updateMapNote('Unable to load the Pokémon list. Please refresh the page.');
            premiumStatus.textContent = 'Unable to load fighters for premium video creation.';
        });

    select.addEventListener('change', () => {
        const url = select.value;

        if (!url) {
            display.innerHTML = `
                <div class="placeholder">
                    <span>Select a Pokémon to load its image and location.</span>
                </div>
            `;
            hideMarker();
            updateMapNote('Pick a Pokémon to place the marker where it can be found.');
            return;
        }

        fetch(url)
            .then(response => response.json())
            .then(pokemon => {
                return fetch(pokemon.location_area_encounters)
                    .then(response => response.json())
                    .then(encounters => ({ pokemon, location: findLocation(encounters) }));
            })
            .then(({ pokemon, location }) => {
                renderPokemonCard(pokemon, location);
            })
            .catch(() => {
                display.innerHTML = `
                    <div class="placeholder">
                        <span>Unable to load that Pokémon right now. Please try another one.</span>
                    </div>
                `;
                hideMarker();
                updateMapNote('Unable to fetch Pokémon details.');
            });
    });
});
