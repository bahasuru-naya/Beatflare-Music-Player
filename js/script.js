//Created by Bahasuru Nayanakantha
const fileInput = document.getElementById('file-input');
const audioPlayer = document.getElementById('audio-player');
const playPauseButton = document.getElementById('play-pause');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const seekBar = document.getElementById('seek-bar');
const repeatsong = document.querySelector("#repeatsong");
const randomsong = document.querySelector("#randomsong");
const volumeSlider = document.getElementById('volume');
const playlist = document.getElementById('playlist');
const currentTimeLabel = document.getElementById('current-time');
const durationLabel = document.getElementById('duration');
const canvas1 = document.getElementById('canvas1');
const canvas2 = document.getElementById('canvas2');
const canvas3 = document.getElementById('canvas3');
const visual1 = document.getElementById('visual1');
const visual2 = document.getElementById('visual2');
const visual3 = document.getElementById('visual3');
const player = document.getElementById('player');
const partytoggle = document.getElementById("party-on-off");

repeatsong.disabled = true;
randomsong.disabled = true;

let files = [];
let currentIndex = -1;
let listItemMap = new Map();
let isAudioConnected = false;

audioPlayer.volume = 0.5;
audioPlayer.playbackRate = 1;
let speed = 1;

const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');
const ctx3 = canvas3.getContext('2d');
let audio;
let audiosrc;
let analyser;
let animation;
let audioctx;

document.addEventListener('DOMContentLoaded', function () {
    // Set the canvas height initially
    setWidthHeight();
    window.addEventListener('resize', setWidthHeight);
    const playlisttext = document.createElement('p');
    playlisttext.setAttribute("id", "playlist-text");
    playlisttext.innerHTML = `Playlist is empty... Add songs to start playing.<br>Can't find any songs? Try <a id="sample-music" title="Add sample music to the playlist." href="#" onclick="playsamplemusic(); return false;" >sample music</a> `;
    playlist.appendChild(playlisttext);
    document.querySelector(".play-pause-back").style.opacity = "0.5";
    document.querySelector(".searchbtn").style.opacity = "0.5";
    document.querySelector(".searchbtn").style.cursor = "not-allowed";
    playPauseButton.disabled = true;
    seekBar.disabled = true;
    removeAll.disabled = true;
    searchbtntext.disabled = true;
    loadsettings();
    loadFilesFromStorage();

});


async function saveFilesToStorage() {
    await saveFilesToIndexedDB();
}

async function loadFilesFromStorage() {
    try {
        files = await loadFilesFromIndexedDB();
        if (files.length > 0) {
            if (document.getElementById('playlist-text')) {
                document.getElementById('playlist-text').remove();
            }

            document.querySelector(".play-pause-back").style.opacity = "1";
            document.querySelector(".searchbtn").style.opacity = "1";
            document.querySelector(".searchbtn").style.cursor = "pointer";
            playPauseButton.disabled = false;
            seekBar.disabled = false;
            removeAll.disabled = false;
            searchbtntext.disabled = false;

            // Call necessary update functions
            updatePlaylist();
            setWidthHeight();
            updateButtonsState(currentIndex);
            fileInput.value = '';
            folderInput.value = '';
            updatePlaylistHighlight(currentIndex);
            const file = files[currentIndex];
            const songTitle = file.name.replace('.mp3', '');
            const fileURL = URL.createObjectURL(files[currentIndex]);
            audioPlayer.src = fileURL;
            audioPlayer.currentTime = 0;
            audioPlayer.playbackRate = parseFloat(speed);
            audioPlayer.pause();
            playPauseButton.innerHTML = playsvg;
            // Display the song name in the marquee        
            updateSongName(`Paused: ${songTitle}`);
            if (audioctx) audioctx.suspend();
            if (animation) window.cancelAnimationFrame(animation);
            restoreActiveIndexText();
            scrollToActive();
            const cfile = files[currentIndex];
            jsmediatags.read(cfile, {
                onSuccess: function (tag) {
                    const { picture } = tag.tags;
                    if (picture) {
                        // Convert the album art data into a Blob URL
                        const byteArray = new Uint8Array(picture.data);
                        let binary = '';
                        byteArray.forEach(byte => binary += String.fromCharCode(byte));
                        const dataUrl = `data:${picture.format};base64,${btoa(binary)}`;

                        img.src = dataUrl;
                        img.style.display = 'block';
                    } else {
                        img.style.display = 'block';
                        img.src = "./images/art.png";
                    }
                },
                onError: function (error) {
                    console.error('Error reading MP3 file:', error);
                    img.style.display = 'block';
                    img.src = "./images/art.png";
                }
            });

        } else {
            files = [];
            listItemMap = new Map();
        }
        console.log('Files loaded from storage');
    } catch (error) {
        console.error(error);
        files = [];
        listItemMap = new Map();
    }
}


window.addEventListener('resize', setWidthHeight);

function setWidthHeight() {
    if (player && visual1) {
        visual1.style.height = player.offsetHeight - 20 + 'px';
    }
    if (player && visual2) {
        visual2.style.height = player.offsetHeight - 20 + 'px';
    }
    if (player && visual3) {
        visual3.style.height = player.offsetHeight - 20 + 'px';
    }

    const acontrol = document.querySelector('#audio-control');
    acontrol.style.display = 'block'
    const playerWidth = document.querySelector(".player").offsetWidth;
    if (playerWidth >= 800) {
        acontrol.style.display = 'inline-flex';
        playlist.style.height = '330px';
    }
    else {
        acontrol.style.display = 'block';
        playlist.style.height = '250px';
    }

    const songNameElement = document.getElementById("songName");
    var maqcontainer = 0;
    document.querySelector(".marquee").style.width = maqcontainer + 'px';
    maqcontainer = document.querySelector(".volumemute").offsetWidth;
    document.querySelector(".marquee").style.width = maqcontainer + 'px';
    songNameElement.style.animation = "none";
    const containerWidth = maqcontainer;
    const textWidth = songNameElement.offsetWidth;
    const animationDuration = (textWidth + containerWidth) / 100;
    songNameElement.style.animation = `marquee ${animationDuration}s linear infinite`;

    const settingsback = document.querySelector("#settings");
    settingsback.style.maxHeight = "none";
    settingsback.style.height = "auto";

}

const eqBands = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const eqcontainer = document.querySelector('#equ');

let filters;
let panNode;
let gainNode;
let jungle;
let lowfilter;
let highfilter;


//visualizer and other effects
function audiovisual(player) {
    audio = player;
    audioctx = new AudioContext();
    setWidthHeight();

    if (!isAudioConnected) {

        audiosrc = audioctx.createMediaElementSource(audio);
        analyser = audioctx.createAnalyser();

        analyser.fftSize = 256;
        isAudioConnected = true;

        jungle = new Jungle(audioctx);
        jungle.setPitchTranspose(0, 0);
        audiosrc.connect(jungle.input);

        filters = eqBands.map(freq => {
            const filter = audioctx.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            return filter;
        });

        filters.reduce((prev, curr) => {
            prev.connect(curr);
            return curr;
        });

        lowfilter = audioctx.createBiquadFilter();
        lowfilter.type = "lowpass";
        lowfilter.frequency.value = 24000;

        highfilter = audioctx.createBiquadFilter();
        highfilter.type = "highpass";
        highfilter.frequency.value = 20;

        panNode = new StereoPannerNode(audioctx);
        panNode.pan.value = 0;

        jungle.output.connect(filters[0]);

        filters[filters.length - 1].connect(panNode);
        panNode.connect(lowfilter);
        lowfilter.connect(highfilter);
        highfilter.connect(analyser);
        analyser.connect(audioctx.destination);

    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let barWidth = (canvas1.width / bufferLength) * 1.3;
    let barHeight;
    let x;

    function animate1() {
        if (document.querySelector('[data-id="step1"]').classList.contains("live")) {
            x = 0;
            ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
            analyser.getByteFrequencyData(dataArray);

            for (let i = 0; i < bufferLength; i++) {
                barHeight = Math.max((dataArray[i] * 20) / 13, 2);
                ctx1.fillStyle = generateRandomColor(dataArray[i]);
                ctx1.fillRect(x, canvas1.height, barWidth, -barHeight);
                x += barWidth + 1;
            }
        }

        animation = requestAnimationFrame(animate1);
    }

    let hue = 0;
    function animate2() {
        if (document.querySelector('[data-id="step2"]').classList.contains("live")) {
            // Clear the canvas
            ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

            // Get frequency data
            analyser.getByteFrequencyData(dataArray);

            // Set the background color
            ctx2.fillStyle = '#000'; // Black background
            ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

            // Circle parameters
            let points = 200;
            let radius = 50;
            const numlines = 43;
            let cX = canvas2.width / 2;
            let cY = canvas2.height / 2;

            // Scaling factors for roundness
            let scaleX = canvas2.width / Math.max(canvas2.width, canvas2.height);
            let scaleY = canvas2.height / Math.max(canvas2.width, canvas2.height);

            // Calculate radians per data point
            let radianAdd = ((Math.PI * 6)) / numlines; // Full circle
            let radian = 0;
            let radianc = 0;

            // Line styles
            ctx2.strokeStyle = "hsl(" + hue + ", 100%, 50%)";
            ctx2.lineWidth = 3;
            ctx2.lineCap = 'round';
            ctx2.lineJoin = 'round';

            // draw circle
            for (let i = 0; i < points; i++) {
                // Calculate starting point of the line
                let xStart = radius * Math.cos(radianc) * scaleX + cX;
                let yStart = radius * Math.sin(radianc) * scaleY + cY;

                // Clamp the data value
                let v = 35;

                // Calculate ending point of the line
                let xEnd = v * Math.cos(radianc) * scaleX + cX;
                let yEnd = v * Math.sin(radianc) * scaleY + cY;

                // Draw the line
                ctx2.beginPath();
                ctx2.moveTo(xStart, yStart);
                ctx2.lineTo(xEnd, yEnd);
                ctx2.stroke();

                // Increment radian for the next line
                radianc += ((Math.PI * 2)) / points;
            }


            // Draw frequency-based radial lines
            for (let i = 10; i < numlines + 10; i++) {
                // Calculate starting point of the line
                let xStart = radius * Math.cos(radian) * scaleX + cX;
                let yStart = radius * Math.sin(radian) * scaleY + cY;

                // Clamp the data value
                let v = Math.max(dataArray[i] / 1.65, radius);

                // Calculate ending point of the line
                let xEnd = v * Math.cos(radian) * scaleX + cX;
                let yEnd = v * Math.sin(radian) * scaleY + cY;

                // Draw the line
                ctx2.beginPath();
                ctx2.moveTo(xStart, yStart);
                ctx2.lineTo(xEnd, yEnd);
                ctx2.stroke();

                // Increment radian for the next line
                radian += radianAdd;
            }
            hue += 0.5;
            if (hue > 360) {
                hue = 0;
            }
        }
        animation = requestAnimationFrame(animate2);
    }

    function animate3() {
        if (document.querySelector('[data-id="step3"]').classList.contains("live")) {
            ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
            analyser.getByteTimeDomainData(dataArray);

            const bufferLength = analyser.frequencyBinCount;
            const centerX = canvas3.width / 2;
            const centerY = canvas3.height / 2;
            const maxRadius = Math.min(centerX, centerY) * 0.7;

            const numCircles = 5;
            const circleColors = [
                'rgba(187, 248, 4, 0.89)',
                'rgba(5, 249, 41, 0.8)',
                'rgba(150, 180, 255, 0.93)',
                'rgba(248, 29, 14, 0.91)',
                'rgba(248, 7, 248, 0.89)'
            ];
            const radiusStep = maxRadius / numCircles;
            const sliceAngle = (Math.PI * 2) / (bufferLength * 2);

            for (let c = 0; c < numCircles; c++) {
                const currentBaseRadius = radiusStep * (c + 1);
                const startAngleOffset = (Math.PI * 2 / numCircles) * c;

                ctx3.lineWidth = 2;
                ctx3.strokeStyle = circleColors[c % circleColors.length];
                ctx3.fillStyle = 'rgba(0,0,0,0)';
                ctx3.lineCap = "round";

                ctx3.beginPath();

                let index;
                for (let i = 0; i < bufferLength * 2; i++) {

                    if (i < bufferLength) {
                        index = i;
                    } else {
                        index = index - 1;
                    }
                    const amplitude = (dataArray[index] / 128.0) - 1.0;
                    const amplitudeFactor = currentBaseRadius * 0.65;
                    const currentRadius = currentBaseRadius + (amplitude * amplitudeFactor);

                    const angle = startAngleOffset + (sliceAngle * i) - (Math.PI / 2);

                    const x = centerX + currentRadius * Math.cos(angle);
                    const y = centerY + currentRadius * Math.sin(angle);

                    if (i === 0) {
                        ctx3.moveTo(x, y);
                    } else {
                        ctx3.lineTo(x, y);
                    }
                }

                ctx3.closePath();
                ctx3.stroke();
            }
        }

        animation = requestAnimationFrame(animate3);
    }


    let lastThemeUpdate = 0;
    let themeUpdateInterval = 250; // update theme every 250ms

    function animate4() {
        if (partytoggle.checked) {
            now = Date.now();
            if (now - lastThemeUpdate > themeUpdateInterval) {
                if (audioPlayer.paused) {
                    const selectedTheme = themes[themeSelect.value];
                    if (selectedTheme) {
                        Object.keys(selectedTheme).forEach(key => {
                            document.documentElement.style.setProperty(key, selectedTheme[key]);
                        });
                    }

                } else {
                    partyTheme();
                    lastThemeUpdate = now;
                }

            }
        }
        animation = requestAnimationFrame(animate4);
    }


    function partyTheme() {
        if (dataArray.length === 0) return;
        let sum = dataArray.reduce((sum, value) => sum + value, 0);
        let average = sum / dataArray.length;

        const themeKeys = Object.keys(themes);
        let themeIndex = (Math.floor(average) % (themeKeys.length * 100)) % themeKeys.length;

        const selectedThemeKey = themeKeys[themeIndex];
        const selectedTheme = themes[selectedThemeKey];

        if (selectedTheme) {
            Object.keys(selectedTheme).forEach(key => {
                document.documentElement.style.setProperty(key, selectedTheme[key]);
            });
            document.documentElement.style.setProperty("--menu-color", "rgb(0, 0, 0)");
            document.documentElement.style.setProperty("--menu-text-color", "rgb(255, 255, 255)");

        }

    }

    animate1();
    animate2();
    animate3();
    animate4();
}

let confettiRunning = false;
let confettiAnimationId = null;
let canvasConfetti = null;

async function startConfetti() {
    const canvas = document.getElementById("my-canvas-confetti");

    // Initialize confetti only once
    if (!canvas.confetti) {
        canvas.confetti = await confetti.create(canvas, { resize: true });
    }

    canvasConfetti = canvas.confetti;

    function frame() {
        if (!partytoggle.checked || audioPlayer.paused) {
            confettiRunning = false;
            return;
        }

        // Fire from left
        canvasConfetti({
            particleCount: 1,
            angle: 60,
            spread: 90,
            origin: { x: 0 },
        });

        // Fire from right
        canvasConfetti({
            particleCount: 1,
            angle: 120,
            spread: 90,
            origin: { x: 1 },
        });

        confettiAnimationId = requestAnimationFrame(frame);
    }

    if (!confettiRunning) {
        confettiRunning = true;
        frame();
    }
}

//generate random color
function generateRandomColor(barHeight) {
    if (barHeight === undefined || barHeight === null) {
        barHeight = 0;
    }
    else {
        barHeight = Math.max(0, Math.min(255, barHeight));
    }

    // Use barHeight to influence hue 
    let hue = (barHeight * 1.5 + Math.floor(Math.random() * 60)) % 360;
    let saturation = 90;
    let lightness = 40;

    // Convert HSL to RGB
    function hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
        else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
        else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
        else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
        else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
        else if (h >= 300 && h < 360) [r, g, b] = [c, 0, x];

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return { r, g, b };
    }

    const { r, g, b } = hslToRgb(hue, saturation, lightness);
    return `rgb(${r}, ${g}, ${b})`;
}

//update current song name
function updateSongName(newText) {
    const songNameElement = document.getElementById("songName");
    const maqcontainer = document.querySelector(".volumemute").offsetWidth;

    // Split text into prefix and song name after colon
    const parts = newText.split(':');
    if (parts.length > 1) {
        const prefix = parts[0] + ':';
        const songTitle = parts.slice(1).join(':').trim();
        songNameElement.innerHTML = `${prefix} <a id="currentsonglink" title="Scroll playlist to now playing" href="#" onclick="scrollToActive(); return false;">${songTitle}</a>`;
    } else {
        songNameElement.textContent = newText;
    }

    document.querySelector(".marquee").style.width = maqcontainer + 'px';
    songNameElement.style.animation = "none";
    void songNameElement.offsetWidth;

    const containerWidth = document.querySelector(".marquee").offsetWidth;
    const textWidth = songNameElement.offsetWidth;
    const animationDuration = (textWidth + containerWidth) / 90;

    songNameElement.style.animation = `marquee ${animationDuration}s linear infinite`;

}
const elementsongname = document.querySelector('#songName');

elementsongname.addEventListener('mouseenter', () => {
    elementsongname.style.animationPlayState = 'paused';
});

elementsongname.addEventListener('mouseleave', () => {
    elementsongname.style.animationPlayState = 'running';
});

function scrollToActive() {
    if (search) {
        search = false;
        closeserch();
    }
    const list = document.getElementById('playlist');
    const activeItem = list.querySelector('li.active');

    if (activeItem) {
        // Compute relative offset of activeItem inside playlist container
        const itemTop = activeItem.getBoundingClientRect().top;
        const listTop = list.getBoundingClientRect().top;
        const relativeOffsetTop = itemTop - listTop;

        const listHeight = list.clientHeight;
        const itemHeight = activeItem.offsetHeight;

        // Check if item is outside visible area
        if (relativeOffsetTop < 0 || relativeOffsetTop + itemHeight > listHeight) {
            const scrollTo = list.scrollTop + relativeOffsetTop - (listHeight / 2) + (itemHeight / 2);
            list.scrollTo({
                top: scrollTo,
                behavior: 'smooth'
            });
        }

        activeItem.classList.add('blink-1');
        // Remove the class after animation ends to allow retriggering later
        activeItem.addEventListener('animationend', function handleAnimationEnd() {
            activeItem.classList.remove('blink-1');
            activeItem.removeEventListener('animationend', handleAnimationEnd);
        });
    } else {
        console.log('No active item found.');
    }
}

function scrollToBottomPlaylist() {
    const list = document.getElementById('playlist');
    list.scrollTo({
        top: list.scrollHeight,
        behavior: 'smooth'
    });
}

function scrollToTopPlaylist() {
    const list = document.getElementById('playlist');
    list.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

repeatsong.addEventListener('change', () => {
    if (repeatsong.checked) {
        randomsong.checked = false;
    }
    localStorage.setItem('repeatEnabled', repeatsong.checked ? 'true' : 'false');
    localStorage.setItem('randomEnabled', randomsong.checked ? 'true' : 'false');
});

let playedrandomArray = [];

randomsong.addEventListener('change', () => {
    if (randomsong.checked) {
        repeatsong.checked = false;
    } else {
        playedrandomArray = [];
    }
    localStorage.setItem('repeatEnabled', repeatsong.checked ? 'true' : 'false');
    localStorage.setItem('randomEnabled', randomsong.checked ? 'true' : 'false');
});

function showerror(message) {
    const error = document.querySelector('#error');
    const errorBack = document.querySelector('#error-back');
    const errorText = document.querySelector('#error .message');
    errorText.textContent = message;
    error.style.display = 'block';
    errorBack.style.display = 'block';
}

const sampleFileNames = ['Elektronomia-Energy-Sample-Music.mp3', 'Elektronomia-Limitless-Sample-Music.mp3', 'LFZ-Popsicle-Sample-Music.mp3'];
const attributions = ["Song: Elektronomia - Energy [NCS Release] \n Music provided by NoCopyrightSounds \n Free Download/Stream: http://ncs.io/energy \n Watch: http://youtu.be/fzNMd3Tu1Zw",
    "Song: Elektronomia - Limitless [NCS Release] \n Music provided by NoCopyrightSounds \n Free Download/Stream: http://ncs.io/Limitless \n Watch: http://youtu.be/cNcy3J4x62M",
    "Song: LFZ - Popsicle [NCS Release] \n Music provided by NoCopyrightSounds \n Free Download/Stream: http://ncs.io/Popsicle \n Watch: http://youtu.be/K8DUjObr_tU"];

const attributionMap = Object.fromEntries(
    sampleFileNames.map((file, index) => [file, attributions[index]])
);

function getAttribution(filename) {
    return attributionMap[filename] || "No attribution found";
}

function showinfo(filename) {
    const info = document.querySelector('#info');
    const infoBack = document.querySelector('#info-back');
    const infoTitle = document.querySelector('#info .header .alert');
    const infoText = document.querySelector('#info .message');
    infoTitle.textContent = "\"" + filename.replace(/\.[^/.]+$/, "") + "\" Attribution";
    infoText.textContent = getAttribution(filename);
    infoText.style.whiteSpace = "pre-line";
    info.style.display = 'block';
    infoBack.style.display = 'block';
}

function playsamplemusic() {
    const folderPath = '../src/Audio/';

    const loadingOverlay = document.getElementById('loading-back');
    // Show loading overlay
    if (loadingOverlay) loadingOverlay.style.display = 'block';


    const fetchPromises = sampleFileNames.map(async fileName => {
        const fileUrl = folderPath + fileName;
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(`Failed to load ${fileName}`);
        const blob = await response.blob();
        return new File([blob], fileName, { type: blob.type });
    });

    Promise.all(fetchPromises)
        .then(fetchedFiles => {
            // Add all files to the playlist
            fetchedFiles.forEach(file => files.push(file));
            // Remove playlist text if visible
            const playlistText = document.getElementById('playlist-text');
            if (playlistText) playlistText.remove();

            // Enable UI controls
            document.querySelector(".play-pause-back").style.opacity = "1";
            document.querySelector(".searchbtn").style.opacity = "1";
            document.querySelector(".searchbtn").style.cursor = "pointer";
            playPauseButton.disabled = false;
            seekBar.disabled = false;
            removeAll.disabled = false;
            searchbtntext.disabled = false;

            // Update UI
            updatePlaylist();
            setWidthHeight();
            updateButtonsState(currentIndex);
            audiovisual(audioPlayer);
            fileInput.value = '';
            folderInput.value = '';
            scrollToBottomPlaylist();
        })
        .catch(err => {
            loadingOverlay.style.display = 'none';
            console.error('An error occurred while processing the file input:', err.message);
            showerror(err.message);
            fileInput.value = '';
            folderInput.value = '';
        })
        .finally(() => {
            if (loadingOverlay) {
                setTimeout(() => {
                    if (currentIndex === -1 && files.length > 0) {
                        playFile(0);
                    }
                    else if (currentIndex >= 0 && currentIndex < files.length) {
                        playFile(currentIndex);
                    }
                    loadingOverlay.style.display = 'none';
                }, 2000);
            }
        });
}

fileInput.addEventListener('change', function (event) {
    try {
        // Ensure files exist in the input event
        if (!event.target.files) {
            throw new Error('No files were selected.');
        }
        const newFiles = Array.from(event.target.files);

        // Validate files array before updating
        if (!Array.isArray(newFiles) || newFiles.length === 0) {
            throw new Error('No valid files to add.');
        }

        // Check for invalid file types
        const allowedExtensions = ['mp3', 'wav'];
        const invalidFiles = newFiles.filter(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            return !allowedExtensions.includes(extension);
        });

        if (invalidFiles.length > 0) {
            throw new Error('Only .mp3 and .wav files are allowed. Please try again with valid files.');
        }

        // Safely update the files array
        files = [...files, ...newFiles];

        if (document.getElementById('playlist-text')) {
            document.getElementById('playlist-text').remove();
        }

        document.querySelector(".play-pause-back").style.opacity = "1";
        document.querySelector(".searchbtn").style.opacity = "1";
        document.querySelector(".searchbtn").style.cursor = "pointer";
        playPauseButton.disabled = false;
        seekBar.disabled = false;
        removeAll.disabled = false;
        searchbtntext.disabled = false;

        // Call necessary update functions
        updatePlaylist();
        setWidthHeight();
        updateButtonsState(currentIndex);
        audiovisual(audioPlayer);
        fileInput.value = '';

    } catch (error) {
        console.error('An error occurred while processing the file input:', error.message);
        showerror(error.message);
        fileInput.value = ''; // Clear the input on error
    }

    // Handle edge case when no file is playing
    if (currentIndex === -1 && files.length > 0) {
        playFile(0);
    } else {
        scrollToBottomPlaylist();
    }

});

const folderInput = document.getElementById('folder-input');

folderInput.addEventListener('change', function (event) {
    try {
        const selectedFiles = Array.from(event.target.files);

        if (!selectedFiles || selectedFiles.length === 0) {
            throw new Error('No files were selected.');
        }

        // Filter only .mp3 and .wav files
        const audioFiles = selectedFiles.filter(file => {
            const extension = file.name.split('.').pop().toLowerCase();
            return ['mp3', 'wav'].includes(extension);
        });

        if (audioFiles.length === 0) {
            throw new Error('The selected folder does not contain any songs(.mp3 or .wav files). Please try again with a different folder.');
        }

        // Add to global file list
        files = [...files, ...audioFiles];

        // Update UI
        if (document.getElementById('playlist-text')) {
            document.getElementById('playlist-text').remove();
        }

        document.querySelector(".play-pause-back").style.opacity = "1";
        document.querySelector(".searchbtn").style.opacity = "1";
        document.querySelector(".searchbtn").style.cursor = "pointer";
        playPauseButton.disabled = false;
        seekBar.disabled = false;
        removeAll.disabled = false;
        searchbtntext.disabled = false;

        updatePlaylist();
        setWidthHeight();
        updateButtonsState(currentIndex);
        audiovisual(audioPlayer);
        folderInput.value = '';

        // Auto-play first file if nothing playing
        if (currentIndex === -1 && files.length > 0) {
            playFile(0);
        } else {
            scrollToBottomPlaylist();
        }

    } catch (error) {
        console.error('File processing error:', error.message);
        showerror(error.message);
        folderInput.value = ''; // Clear input
    }
});

function updatePlaylist() {
    playlist.innerHTML = '';
    listItemMap.clear();
    files.forEach((file, index) => {
        const listItem = document.createElement('li');
        const listItemindexc = document.createElement('div');
        listItemindexc.classList.add('liindexc');
        const listItemindex = document.createElement('p');
        listItemindex.classList.add('liindex');
        listItemindex.textContent = index + 1;
        listItemindexc.appendChild(listItemindex);
        const listItemtext = document.createElement('p');
        listItemtext.classList.add('litext');
        listItemtext.textContent = file.name;
        listItemtext.textContent = listItemtext.textContent.replace(/_/g, " ");
        listItem.setAttribute('data-index', index);
        listItem.appendChild(listItemindexc);
        listItem.appendChild(listItemtext);

        if (sampleFileNames.includes(file.name)) {
            const infobutton = document.createElement("button");
            infobutton.classList.add("info");
            infobutton.title = "See attribution";
            // Create the SVG element 
            infobutton.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>`;
            listItemtext.appendChild(infobutton);
            infobutton.addEventListener('click', (e) => {
                e.stopPropagation();
                showinfo(file.name);
            });
        }

        if (index !== 0) {
            const upbutton = document.createElement("button");
            upbutton.classList.add("up");
            upbutton.title = "Move up";
            // Create the SVG element 
            upbutton.innerHTML = `
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 15 7-7 7 7"/>
            </svg>`;
            listItem.appendChild(upbutton);
            upbutton.addEventListener('click', (e) => {
                e.stopPropagation();
                handleupFile(index)
            });
        }

        if (index !== files.length - 1) {
            const downbutton = document.createElement("button");
            downbutton.classList.add("down");
            downbutton.title = "Move down";
            // Create the SVG element 
            downbutton.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
            </svg>`;
            listItem.appendChild(downbutton);
            downbutton.addEventListener('click', (e) => {
                e.stopPropagation();
                handledownFile(index);

            });
        }

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove');
        removeButton.title = "Remove from playlist";
        removeButton.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
        </svg>`;
        listItem.appendChild(removeButton);

        listItem.addEventListener('click', () => {
            if (search) {
                search = false;
                closeserch();
                const list = document.getElementById('playlist');
                // Compute relative offset of activeItem inside playlist container
                const itemTop = listItem.getBoundingClientRect().top;
                const listTop = list.getBoundingClientRect().top;
                const relativeOffsetTop = itemTop - listTop;

                const listHeight = list.clientHeight;
                const itemHeight = listItem.offsetHeight;

                // Check if item is outside visible area
                if (relativeOffsetTop < 0 || relativeOffsetTop + itemHeight > listHeight) {
                    const scrollTo = list.scrollTop + relativeOffsetTop - (listHeight / 2) + (itemHeight / 2);
                    list.scrollTo({
                        top: scrollTo,
                        behavior: 'smooth'
                    });
                }

                listItem.classList.add('blink-1');
                // Remove the class after animation ends to allow retriggering later
                listItem.addEventListener('animationend', function handleAnimationEnd() {
                    listItem.classList.remove('blink-1');
                    listItem.removeEventListener('animationend', handleAnimationEnd);
                });
            }
            else {
                playFile(index);

            }
        });
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            handleRemoveFile(index);
            if (search) {
                searchsongs();
            }
        });

        playlist.appendChild(listItem);
        listItemMap.set(index, listItem);
    });
    updateButtonsState(currentIndex);
    updatePlaylistHighlight(currentIndex);
    saveFilesToStorage();

    if (audioPlayer.paused) {
        restoreActiveIndexText();
    } else {
        replaceActiveWithLoading();
    }

    if (files.length > 0) {
        repeatsong.disabled = false;
    }
    if (files.length < 2) {
        randomsong.disabled = true;
        randomsong.checked = false;

    } else if (files.length > 1) {
        randomsong.disabled = false;
    }

}

function handleupFile(index) {
    const listItem1 = listItemMap.get(index);
    const listItem2 = listItemMap.get(index - 1);
    if (listItem1 && listItem2) {
        // Swap the list items in the DOM
        const parent = listItem1.parentNode;
        parent.insertBefore(listItem1, listItem2);
        parent.insertBefore(listItem2, listItem1.nextSibling);

        // Update the indices in the files array
        const temp = files[index];
        files[index] = files[index - 1];
        files[index - 1] = temp;

        // Update the data-index attributes
        listItem1.setAttribute('data-index', index - 1);
        listItem2.setAttribute('data-index', index);

        // Update the listItemMap
        listItemMap.set(index, listItem1);
        listItemMap.set(index - 1, listItem2);

        // If currentIndex is affected, update it
        if (currentIndex === index) {
            currentIndex--;
            localStorage.setItem('currentIndex', currentIndex);

        } else if (currentIndex === index - 1) {
            currentIndex++;
            localStorage.setItem('currentIndex', currentIndex);

        }
        updateIndicesAndMap();
        updatePlaylist();
    }
    updatePlaylistHighlight(currentIndex);
}

function handledownFile(index) {
    const listItem1 = listItemMap.get(index);
    const listItem2 = listItemMap.get(index + 1);
    if (listItem1 && listItem2) {
        // Swap the list items in the DOM
        const parent = listItem1.parentNode;
        parent.insertBefore(listItem2, listItem1);
        parent.insertBefore(listItem1, listItem2.nextSibling);

        // Update the indices in the files array
        const temp = files[index];
        files[index] = files[index + 1];
        files[index + 1] = temp;

        // Update the data-index attributes
        listItem1.setAttribute('data-index', index + 1);
        listItem2.setAttribute('data-index', index);

        // Update the listItemMap
        listItemMap.set(index, listItem2);
        listItemMap.set(index + 1, listItem1);

        // If currentIndex is affected, update it
        if (currentIndex === index) {
            currentIndex++;
            localStorage.setItem('currentIndex', currentIndex);

        } else if (currentIndex === index + 1) {
            currentIndex--;
            localStorage.setItem('currentIndex', currentIndex);

        }
        updateIndicesAndMap();
        updatePlaylist();
    }
    updatePlaylistHighlight(currentIndex);
}

function handleRemoveFile(index) {
    const listItem = listItemMap.get(index);
    listItem.remove();

    if (index === currentIndex) {
        const wasPaused = audioPlayer.paused;
        if (files.length === 1) {
            // If only one file, remove it completely
            files = [];
            listItemMap.clear();
            updateIndicesAndMap();
            updatePlaylist();
            playlist.innerHTML = '';
            currentIndex = -1;
            localStorage.setItem('currentIndex', currentIndex);
            playPauseButton.innerHTML = playsvg;
            audioPlayer.src = '';
            img.src = "./images/art.png";
            updateSongName('Add songs to your playlist and let the music begin! 🎵✨');
            search = false;
            closeserch();
            const playlisttext = document.createElement('p');
            playlisttext.setAttribute("id", "playlist-text");
            playlisttext.innerHTML = `Playlist is empty... Add songs to start playing.<br>Can't find any songs? Try <a id="sample-music" title="Add sample music to the playlist." href="#" onclick="playsamplemusic(); return false;" >sample music</a> `;
            playlist.appendChild(playlisttext);
            document.querySelector(".play-pause-back").style.opacity = "0.5";
            document.querySelector(".searchbtn").style.opacity = "0.5";
            document.querySelector(".searchbtn").style.cursor = "not-allowed";
            playPauseButton.disabled = true;
            seekBar.disabled = true;
            removeAll.disabled = true;
            searchbtntext.disabled = true;
            repeatsong.disabled = true;


        } else {
            // Determine the next or previous file to play
            if (index < files.length - 1) {
                currentIndex = index;
                localStorage.setItem('currentIndex', currentIndex);
            } else {
                currentIndex = index - 1;
                localStorage.setItem('currentIndex', currentIndex);
            }

            // Remove the file from the array
            files.splice(index, 1);
            listItemMap.delete(index);

            // Update indices and listItemMap
            updateIndicesAndMap();
            updatePlaylist();

            playFile(currentIndex);
            if (wasPaused) {
                audioPlayer.pause();
                playPauseButton.innerHTML = playsvg;

                if (audioctx) audioctx.suspend();
                if (animation) window.cancelAnimationFrame(animation);

                const file = files[currentIndex];
                const songTitle = file.name.replace('.mp3', '');
                updateSongName(`Paused: ${songTitle}`);
                restoreActiveIndexText();
            }

        }
    } else {
        // For other items, just hide and remove them
        files.splice(index, 1);
        listItemMap.delete(index);

        // Update indices and listItemMap
        updateIndicesAndMap();
        updatePlaylist();

        // Update currentIndex if it is after the removed item
        if (index < currentIndex) {
            currentIndex--;
            localStorage.setItem('currentIndex', currentIndex);
        }
    }
    updatePlaylistHighlight(currentIndex);
    if (search) {
        document.querySelectorAll('.up, .down').forEach(button => {
            button.style.display = 'none';
        });
    }

}

function updateIndicesAndMap() {
    files.forEach((index) => {
        const listItem = listItemMap.get(index);
        if (listItem) {
            listItem.setAttribute('data-index', index);
            listItemMap.set(index, listItem);
        }
    });
}

const img = document.getElementById('albumArt');

img.addEventListener('click', function () {
    document.querySelector('#album-art-card').style.display = 'block';
    document.querySelector('#album-art-back').style.display = 'block';
    const albumArtimg = document.querySelector('#album-art-image');
    const albummsg = document.querySelector('#album-art-card .message');
    const fileName = img.src.split("/").pop();
    if (currentIndex >= 0) {
        const file = files[currentIndex];
        const songTitle = file.name.replace('.mp3', '');
        if (fileName !== "art.png") {
            albumArtimg.src = img.src;
            albummsg.textContent = "Album Art for " + songTitle;
            albummsg.style.color = "rgb(74, 74, 74)";
        } else {
            albumArtimg.src = "./images/art.png";
            albummsg.textContent = "Album Art not found for " + songTitle;
            albummsg.style.color = "red";
        }
    } else {
        albumArtimg.src = "./images/art.png";
        albummsg.textContent = "Album Art unavailable and playlist is empty. Add songs to the playlist.";
        albummsg.style.color = "red";
    }
});

var missingFileTitles = [];

//close error msg
document.querySelector('#error_ok').addEventListener('click', function () {
    document.querySelector('#error').style.display = 'none';
    document.querySelector('#error-back').style.display = 'none';
    missingFileTitles = []
});

const errorblurback = document.getElementById('error-back');

errorblurback.addEventListener('click', function (e) {
    if (e.target === errorblurback) {
        document.querySelector('#error').style.display = 'none';
        document.querySelector('#error-back').style.display = 'none';
        missingFileTitles = []
    }
});

//close album art msg
document.querySelector('#album-art-ok').addEventListener('click', function () {
    document.querySelector('#album-art-card').style.display = 'none';
    document.querySelector('#album-art-back').style.display = 'none';
});

const albumBlurback = document.getElementById('album-art-back');

albumBlurback.addEventListener('click', function (e) {
    if (e.target === albumBlurback) {
        document.querySelector('#album-art-card').style.display = 'none';
        document.querySelector('#album-art-back').style.display = 'none';
    }
});

//close info msg
document.querySelector('#info_ok').addEventListener('click', function () {
    document.querySelector('#info').style.display = 'none';
    document.querySelector('#info-back').style.display = 'none';
});

const infoBlurback = document.getElementById('info-back');

infoBlurback.addEventListener('click', function (e) {
    if (e.target === infoBlurback) {
        document.querySelector('#info').style.display = 'none';
        document.querySelector('#info-back').style.display = 'none';
    }
});

audioPlayer.onerror = function () {
    if (files.length > 0) {
        const file = files[currentIndex];
        const songTitle = file.name.replace('.mp3', '');
        missingFileTitles.push(songTitle);
        missingFileNames = missingFileTitles.join(', ');
        console.error('Audio playback failed:', error);
        if (missingFileNames.includes(",")) {
            showerror(`Songs ${missingFileNames} are not found. They are removed from the playlist. You can relocate them by clicking on the "Add Songs" button.`);
        } else {
            showerror(`Song ${missingFileNames} is not found. It is removed from the playlist. You can relocate it by clicking on the "Add Songs" button.`);
        }
        handleRemoveFile(currentIndex);
    }
}

function playFile(index) {
    if (index >= 0 && index < files.length) {
        const file = files[index];
        const songTitle = file.name.replace('.mp3', '');
        const fileURL = URL.createObjectURL(files[index]);
        audioPlayer.src = fileURL;
        audioPlayer.currentTime = 0;
        audioPlayer.playbackRate = parseFloat(speed);
        currentIndex = index;
        localStorage.setItem('currentIndex', currentIndex);

        audioPlayer.play()
            .then(() => {
                playPauseButton.innerHTML = pausesvg;
                updatePlaylistHighlight(index);
                updateButtonsState(index);
                audiovisual(audioPlayer);
                audioctx.resume();
                replaceActiveWithLoading();

                // Display the song name in the marquee        
                updateSongName(`Now Playing: ${songTitle}`);


                // Use jsmediatags to read the MP3 file
                jsmediatags.read(file, {
                    onSuccess: function (tag) {
                        const { picture } = tag.tags;
                        if (picture) {
                            // Convert the album art data into a Blob URL
                            const base64String = picture.data
                                .map((char) => String.fromCharCode(char))
                                .join('');
                            const dataUrl = `data:${picture.format};base64,${btoa(base64String)}`;
                            // Set the image source to the album art
                            img.src = dataUrl;
                            img.style.display = 'block';
                        } else {
                            img.style.display = 'block';
                            img.src = "./images/art.png";
                        }
                    },
                    onError: function (error) {
                        console.error('Error reading MP3 file:', error);
                        img.style.display = 'block';
                        img.src = "./images/art.png";

                    }
                });
            });

    }
    else {
        console.error('Invalid index:', index);
        showerror('Invalid index: ' + index);
    }
}

function updatePlaylistHighlight(index) {
    const items = playlist.children;
    for (let i = 0; i < items.length; i++) {
        items[i].classList.toggle('active', parseInt(items[i].getAttribute('data-index')) === index);
    }
}

function updateButtonsState(index) {
    prevButton.disabled = index <= 0;
    nextButton.disabled = index >= files.length - 1;
}

const playsvg = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z" clip-rule="evenodd"/>
</svg>
`;

const pausesvg = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fill-rule="evenodd" d="M8 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H8Zm7 0a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1Z" clip-rule="evenodd"/>
</svg>
`;

playPauseButton.addEventListener('click', function () {
    const file = files[currentIndex];
    const songTitle = file.name.replace('.mp3', '');

    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseButton.innerHTML = pausesvg;
        // Display the song name in the marquee        
        updateSongName(`Now Playing: ${songTitle}`);
        audiovisual(audioPlayer);
        audioctx.resume();
        replaceActiveWithLoading();
        // Use jsmediatags to read the MP3 file
        jsmediatags.read(file, {
            onSuccess: function (tag) {
                const { picture } = tag.tags;
                if (picture) {
                    // Convert the album art data into a Blob URL
                    const base64String = picture.data
                        .map((char) => String.fromCharCode(char))
                        .join('');
                    const dataUrl = `data:${picture.format};base64,${btoa(base64String)}`;
                    // Set the image source to the album art
                    img.src = dataUrl;
                    img.style.display = 'block';
                } else {
                    img.style.display = 'block';
                    img.src = "./images/art.png";
                }
            },
            onError: function (error) {
                console.error('Error reading MP3 file:', error);
                img.style.display = 'block';
                img.src = "./images/art.png";

            }
        });


    } else {
        audioPlayer.pause();
        playPauseButton.innerHTML = playsvg;
        // Display the song name in the marquee        
        updateSongName(`Paused: ${songTitle}`);
        if (audioctx) audioctx.suspend();
        if (animation) window.cancelAnimationFrame(animation);
        restoreActiveIndexText();

    }
});



audioPlayer.addEventListener("play", () => {
    const file = files[currentIndex];
    const songTitle = file.name.replace('.mp3', '');
    playPauseButton.innerHTML = pausesvg;
    // Display the song name in the marquee        
    updateSongName(`Now Playing: ${songTitle}`);
    audiovisual(audioPlayer);
    audioctx.resume();
    loadsettings();
    replaceActiveWithLoading();
    if (partytoggle.checked) {
        themeSelect.disabled = true;
        startConfetti();
    }

});


audioPlayer.addEventListener("pause", () => {
    const file = files[currentIndex];
    const songTitle = file.name.replace('.mp3', '');
    playPauseButton.innerHTML = playsvg;
    // Display the song name in the marquee        
    updateSongName(`Paused: ${songTitle}`);
    if (audioctx) audioctx.suspend();
    if (animation) window.cancelAnimationFrame(animation);
    restoreActiveIndexText();
    confettiRunning = false;
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
    }
});

function replaceActiveWithLoading() {
    const allItems = document.querySelectorAll('#playlist li');

    allItems.forEach(li => {
        const container = li.querySelector('.liindexc');
        if (!container) return;

        const index = parseInt(li.getAttribute('data-index'), 10);

        if (li.classList.contains('active')) {
            container.innerHTML = `
                <div class="loading">
                    <div class="load"></div>
                    <div class="load"></div>
                    <div class="load"></div>
                    <div class="load"></div>
                </div>
            `;
        } else {
            container.innerHTML = `<p class="liindex">${index + 1}</p>`;
        }
    });
}


function restoreActiveIndexText() {
    const activeLi = document.querySelector('#playlist li.active');
    if (!activeLi) return;

    const index = parseInt(activeLi.getAttribute('data-index'), 10);
    const container = activeLi.querySelector('.liindexc');
    if (!container || isNaN(index)) return;

    container.innerHTML = `<p class="liindex">${index + 1}</p>`;
}


prevButton.addEventListener('click', function () {
    updateIndicesAndMap();
    updatePlaylist();
    if (currentIndex > 0) {
        playFile(currentIndex - 1);
    }
});

nextButton.addEventListener('click', function () {
    updateIndicesAndMap();
    updatePlaylist();
    if (currentIndex < files.length - 1) {
        playFile(currentIndex + 1);
    }
});

audioPlayer.addEventListener('timeupdate', function () {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    seekBar.value = progress;

    currentTimeLabel.textContent = formatTime(audioPlayer.currentTime);
    if (audioPlayer.duration) {
        durationLabel.textContent = formatTime(audioPlayer.duration);
    } else {
        durationLabel.textContent = '0:00';
        seekBar.value = 0;
    }

});

seekBar.addEventListener('input', function () {
    const time = (seekBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = time;
});

const vpresent = document.getElementById('vpresentage');

volumeSlider.addEventListener('input', function () {
    audioPlayer.volume = volumeSlider.value;
    vpresent.textContent = Math.floor(volumeSlider.value * 100) + '%';

    const volume = parseFloat(volumeSlider.value);
    // Save volume to localStorage
    localStorage.setItem('playerVolume', volume);

    if (Math.floor(volumeSlider.value * 100) === 0) {
        mute.checked = true;
        muteicon.innerHTML = mutesvg;
    } else {
        mute.checked = false;
        muteicon.innerHTML = unmutesvg;
    }
});

audioPlayer.addEventListener('ended', function () {
    if (repeatsong.checked) {
        playFile(currentIndex);
    }
    else if (randomsong.checked) {
        if (playedrandomArray.length == files.length) {
            playedrandomArray.splice(0, playedrandomArray.length - 1);
        }
        var randomIndex = Math.floor(Math.random() * files.length);
        while (randomIndex === currentIndex || playedrandomArray.includes(randomIndex)) {
            randomIndex = Math.floor(Math.random() * files.length);
        }
        playedrandomArray.push(randomIndex);
        playFile(randomIndex);

    }
    else if (currentIndex < files.length - 1) {
        playFile(currentIndex + 1);
    } else {

        audioPlayer.pause();
        playPauseButton.innerHTML = playsvg;
        updateSongName(`The playlist has reached its end....`);
        if (audioctx) audioctx.suspend();
        if (animation) window.cancelAnimationFrame(animation);
        restoreActiveIndexText();
    }
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}


const unmutesvg = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.5 8.43A4.985 4.985 0 0 1 17 12a4.984 4.984 0 0 1-1.43 3.5m2.794 2.864A8.972 8.972 0 0 0 21 12a8.972 8.972 0 0 0-2.636-6.364M12 6.135v11.73a1 1 0 0 1-1.64.768L6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l4.36-3.633a1 1 0 0 1 1.64.768Z"/>
</svg>
`;
const mutesvg = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.5 8.43A4.985 4.985 0 0 1 17 12c0 1.126-.5 2.5-1.5 3.5m2.864-9.864A8.972 8.972 0 0 1 21 12c0 2.023-.5 4.5-2.5 6M7.8 7.5l2.56-2.133a1 1 0 0 1 1.64.768V12m0 4.5v1.365a1 1 0 0 1-1.64.768L6 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1m1-4 14 14"/>
</svg>
`;

const mute = document.getElementById('mute');
const muteicon = document.getElementById('mutei');
var vvalue = 0;

mute.addEventListener('click', function () {
    if (mute.checked) {
        muteicon.innerHTML = mutesvg;
        vvalue = volumeSlider.value;
        volumeSlider.value = 0;
        vpresent.textContent = Math.floor(volumeSlider.value * 100) + '%';
        audioPlayer.volume = volumeSlider.value;
        const volume = parseFloat(volumeSlider.value);
        // Save volume to localStorage
        localStorage.setItem('playerVolume', volume);

    } else {
        if (Math.floor(vvalue * 100) === 0) {
            volumeSlider.value = 0.5;
        }
        else {
            volumeSlider.value = vvalue;
        }
        muteicon.innerHTML = unmutesvg;
        vpresent.textContent = Math.floor(volumeSlider.value * 100) + '%';
        audioPlayer.volume = volumeSlider.value;
        const volume = parseFloat(volumeSlider.value);
        // Save volume to localStorage
        localStorage.setItem('playerVolume', volume);

    }
});

//changing speed of audio
const speedControl = document.getElementById("speed");
const speedreset = document.getElementById("speed-reset");
const speedlablel = document.getElementById("speedlabel");


speedControl.addEventListener("input", function () {
    audioPlayer.playbackRate = parseFloat(this.value);
    speedlablel.textContent = this.value + 'x';
    speed = this.value;

    // Save to localStorage
    localStorage.setItem('playbackSpeed', speed);

});

speedreset.addEventListener("click", function () {
    audiovisual(audioPlayer);
    speedControl.value = 1;
    audioPlayer.playbackRate = 1;
    speedlablel.textContent = '1x';
    speed = 1;

    // Save to localStorage
    localStorage.setItem('playbackSpeed', speed);
});


//change audio pitch
const pitchControl = document.getElementById("pitch");
const pitchLabel = document.getElementById("pitchlabel");
const pitchRest = document.getElementById("pitch-reset");


// Event listener for pitch control
pitchControl.addEventListener("change", function () {
    audiovisual(audioPlayer);
});

pitchControl.addEventListener("input", function () {
    const pitchValue = parseFloat(this.value);
    if (jungle) {
        jungle.setPitchTranspose(0, pitchValue);
    }
    pitchLabel.textContent = pitchValue + "x";
    // Save pitch to localStorage
    localStorage.setItem('pitchValue', pitchValue);

});

// Event listener for pitch reset
pitchRest.addEventListener("click", function () {
    audiovisual(audioPlayer);
    pitchControl.value = 0;
    if (jungle) {
        jungle.setPitchTranspose(0, 0);
    }
    pitchLabel.textContent = "0x";
    // Save pitch to localStorage
    localStorage.setItem('pitchValue', pitchControl.value);
});

//equlizer
const equSelect = document.getElementById("equ-select");

const sliders = eqBands.map((freq, idx) => {
    const divslider = document.createElement('div');
    divslider.classList.add('divslider');
    const sliderlabel = document.createElement('label');
    sliderlabel.classList.add('sliderlabel');
    sliderlabel.textContent = freq + 'Hz';
    const slidervlabel = document.createElement('label');
    slidervlabel.classList.add('sliderlabelvalue');
    slidervlabel.textContent = '0 dB';
    const slider = document.createElement('input');
    slider.classList.add('eqslider');
    slider.type = 'range';
    slider.orient = 'vertical';
    slider.title = 'Gain';
    slider.style.direction = 'rtl';
    slider.style.writingMode = 'vertical-lr';
    slider.style.width = '30%';
    slider.style.height = '100%';
    slider.style.alignSelf = 'center';
    slider.style.transition = "all 0.5s ease-in-out";
    slider.min = -12;
    slider.max = 12;
    slider.value = 0;
    slider.step = 0.1;

    slider.addEventListener('input', (event) => {
        if (filters) {
            filters[idx].gain.value = parseFloat(event.target.value);

        }
        slidervlabel.textContent = parseFloat(event.target.value) + ' dB';
        equSelect.value = 'Custom';

        saveEQSettings();
    });
    slider.addEventListener('change', (event) => {
        audiovisual(audioPlayer);
        if (filters) {
            filters[idx].gain.value = parseFloat(event.target.value);
        }
        slidervlabel.textContent = parseFloat(event.target.value) + ' dB';
        equSelect.value = 'Custom';
        localStorage.setItem('eqPreset', equSelect.value);
        saveEQSettings();
    });
    divslider.appendChild(slidervlabel);
    divslider.appendChild(slider);
    divslider.appendChild(sliderlabel);
    eqcontainer.appendChild(divslider);
    return slider;
});


const saveEQSettings = () => {
    const values = sliders.map(slider => parseFloat(slider.value));
    localStorage.setItem('eqSettings', JSON.stringify(values));
};

const eqreset = document.getElementById("equalizer-reset");
const eqlablels = document.querySelectorAll(".sliderlabelvalue");

eqreset.addEventListener("click", function () {
    audiovisual(audioPlayer);
    equSelect.value = 'Flat';
    sliders.forEach((slider) => {
        slider.value = 0;

    });
    if (filters) {
        filters.forEach((filter) => {
            filter.gain.value = 0;

        });
    }
    eqlablels.forEach((label) => {
        label.textContent = '0 dB';

    });
    saveEQSettings();
    localStorage.setItem('eqPreset', equSelect.value);
});

// EQ Preset Select
// EQ Preset Gain Values (in dB)
const eqPresets = {
    "Flat": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "Treble boost": [-4, -3, -2, -1, 0, +1, +2, +3, +4, +6],
    "Bass boost": [6, 5, 4, 3, 2, 0, -1, -2, -3, -4],
    "Laptop": [-3, -3, -2, -1, 0, +1, +2, +3, +3, +4],
    "Portable speakers": [3, 3, 2, 1, 0, -1, -2, -3, -3, -4],
    "TV": [0, 0, 1, 1, 2, 3, 2, 1, 0, -1],
    "Custom": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

document.querySelector("#equ-select option[value='Custom']").style.display = "none";

equSelect.addEventListener("change", function () {
    audiovisual(audioPlayer);
    const preset = this.value;
    const gains = eqPresets[preset];
    if (gains) {
        sliders.forEach((slider, idx) => {
            slider.value = gains[idx];
            if (filters) {
                filters[idx].gain.value = gains[idx];
            }
        });
        eqlablels.forEach((label, idx) => {
            label.textContent = gains[idx] + ' dB';
        });
    }
    saveEQSettings();
    localStorage.setItem('eqPreset', preset);
});

//stereo change
const stereoControl = document.getElementById("Stereo");
const stereoLabel1 = document.getElementById("Stereolabel1");
const stereoLabel2 = document.getElementById("Stereolabel2");
const stereoRest = document.getElementById("Stereo-reset");


// Event listener for stereo control
stereoControl.addEventListener("change", function () {
    audiovisual(audioPlayer);
});

stereoControl.addEventListener("input", function () {
    const stereoValue = parseFloat(this.value);
    if (panNode) {
        panNode.pan.value = stereoValue;
    }

    localStorage.setItem('stereoValue', stereoValue);

    // Update the labels with the new stereo values
    const stereoValue1 = 1 + (-stereoValue);
    const stereoValue2 = 1 + stereoValue;
    stereoLabel1.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + stereoValue1.toFixed(1);
    stereoLabel2.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + stereoValue2.toFixed(1);

});

// Event listener for pitch reset
stereoRest.addEventListener("click", function () {
    audiovisual(audioPlayer);
    stereoControl.value = 0;
    if (panNode) {
        panNode.pan.value = 0;
    }
    localStorage.setItem('stereoValue', stereoControl.value);
    stereoLabel1.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + "1.0";
    stereoLabel2.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + "1.0";

});

//lowpass filter
const lowpassControlF = document.getElementById("filter-f");
const lowpassLabelF = document.getElementById("filterlabel1");
const lowpassControlQ = document.getElementById("filter-q");
const lowpassLabelQ = document.getElementById("filterlabel2");
const lowpassreset = document.getElementById("filter-reset");

let maxValue = 48000 / 2; // Default max value

lowpassControlF.addEventListener("change", function () {
    audiovisual(audioPlayer);
});

lowpassControlF.addEventListener("input", function () {
    const lowpassValue = parseFloat(this.value);
    localStorage.setItem('lowpassControlF', lowpassValue);
    var minValue = 20;
    if (audioctx) {
        maxValue = audioctx.sampleRate / 2;
    } else {
        maxValue = 48000 / 2;
    }
    // Logarithm (base 2) to compute how many octaves fall in the range.
    var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
    // Compute a multiplier from 0 to 1 based on an exponential scale.
    var multiplier = Math.pow(2, numberOfOctaves * (lowpassValue - 1.0));
    if (lowfilter) {
        lowfilter.frequency.value = maxValue * multiplier;
    }
    lowpassLabelF.textContent = (maxValue * multiplier).toFixed(2) + "Hz";

});

var QUAL_MUL = 30;

lowpassControlQ.addEventListener("change", function () {
    audiovisual(audioPlayer);
});

lowpassControlQ.addEventListener("input", function () {
    const lowpassValueQ = parseFloat(this.value);
    localStorage.setItem('lowpassControlQ', lowpassValueQ);
    if (lowfilter) {
        lowfilter.Q.value = lowpassValueQ * QUAL_MUL;
    }
    lowpassLabelQ.textContent = (lowpassValueQ * QUAL_MUL).toFixed(2);
}
);

lowpassreset.addEventListener("click", function () {
    audiovisual(audioPlayer);
    lowpassControlF.value = 1;
    lowpassControlQ.value = 0;

    localStorage.setItem('lowpassControlF', lowpassControlF.value);
    localStorage.setItem('lowpassControlQ', lowpassControlQ.value);

    if (lowfilter) {
        lowfilter.frequency.value = maxValue;
        lowfilter.Q.value = 0;
    }
    lowpassLabelF.textContent = "24000.00Hz";
    lowpassLabelQ.textContent = "0.00";
});

//highpass filter
const highpassControlF = document.getElementById("filter2-f");
const highpassLabelF = document.getElementById("filter2label1");
const highpassControlQ = document.getElementById("filter2-q");
const highpassLabelQ = document.getElementById("filter2label2");
const highpassreset = document.getElementById("filter2-reset");

let maxValue2 = 0;

highpassControlF.addEventListener("change", function () {
    audiovisual(audioPlayer);
});

highpassControlF.addEventListener("input", function () {
    const highpassValue = parseFloat(this.value);
    localStorage.setItem('highpassControlF', highpassValue);

    var minValue2 = 20;
    if (audioctx) {
        maxValue2 = audioctx.sampleRate / 2;
    } else {
        maxValue2 = 48000 / 2;
    }
    // Logarithm (base 2) to compute how many octaves fall in the range.
    var numberOfOctaves2 = Math.log(maxValue2 / minValue2) / Math.LN2;
    // Compute a multiplier from 0 to 1 based on an exponential scale.
    var multiplier2 = Math.pow(2, numberOfOctaves2 * (highpassValue - 1.0));
    if (highfilter) {
        highfilter.frequency.value = maxValue2 * multiplier2;
    }
    highpassLabelF.textContent = (maxValue2 * multiplier2).toFixed(2) + "Hz";
});

var QUAL_MUL2 = 30;

highpassControlQ.addEventListener("change", function () {
    audiovisual(audioPlayer);
});

highpassControlQ.addEventListener("input", function () {
    const highpassValueQ = parseFloat(this.value);
    localStorage.setItem('highpassControlQ', highpassValueQ);
    if (highfilter) {
        highfilter.Q.value = highpassValueQ * QUAL_MUL2;
    }
    highpassLabelQ.textContent = (highpassValueQ * QUAL_MUL2).toFixed(2);
}
);

highpassreset.addEventListener("click", function () {
    audiovisual(audioPlayer);
    highpassControlF.value = 0;
    highpassControlQ.value = 0;
    localStorage.setItem('highpassControlF', highpassControlF.value);
    localStorage.setItem('highpassControlQ', highpassControlQ.value);
    if (highfilter) {
        highfilter.frequency.value = 20;
        highfilter.Q.value = 0;
    }
    highpassLabelF.textContent = "20.00Hz";
    highpassLabelQ.textContent = "0.00";
}
);

//reset all filters
const resetAllFilters = document.getElementById("all-reset");
resetAllFilters.addEventListener("click", function () {

    audiovisual(audioPlayer);
    speedControl.value = 1;
    audioPlayer.playbackRate = 1;
    speedlablel.textContent = '1x';
    speed = 1;

    // Save to localStorage
    localStorage.setItem('playbackSpeed', speed);

    pitchControl.value = 0;
    if (jungle) {
        jungle.setPitchTranspose(0, 0);
    }
    pitchLabel.textContent = "0x";

    // Save pitch to localStorage
    localStorage.setItem('pitchValue', pitchControl.value);

    equSelect.value = 'Flat';
    sliders.forEach((slider) => {
        slider.value = 0;

    });
    if (filters) {
        filters.forEach((filter) => {
            filter.gain.value = 0;

        });
    }
    eqlablels.forEach((label) => {
        label.textContent = '0 dB';

    });
    saveEQSettings();
    localStorage.setItem('eqPreset', equSelect.value);

    stereoControl.value = 0;
    if (panNode) {
        panNode.pan.value = 0;
    }
    localStorage.setItem('stereoValue', stereoControl.value);
    stereoLabel1.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + "1.0";
    stereoLabel2.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + "1.0";

    lowpassControlF.value = 1;
    lowpassControlQ.value = 0;

    localStorage.setItem('lowpassControlF', lowpassControlF.value);
    localStorage.setItem('lowpassControlQ', lowpassControlQ.value);

    if (lowfilter) {
        lowfilter.frequency.value = maxValue;
        lowfilter.Q.value = 0;
    }
    lowpassLabelF.textContent = "24000.00Hz";
    lowpassLabelQ.textContent = "0.00";

    highpassControlF.value = 0;
    highpassControlQ.value = 0;
    localStorage.setItem('highpassControlF', highpassControlF.value);
    localStorage.setItem('highpassControlQ', highpassControlQ.value);
    if (highfilter) {
        highfilter.frequency.value = 20;
        highfilter.Q.value = 0;
    }
    highpassLabelF.textContent = "20.00Hz";
    highpassLabelQ.textContent = "0.00";

});


//visualizer on off
const visualonoff = document.getElementById("visualizer-on-off");
const playersection = document.querySelector(".section-center");

visualonoff.addEventListener("click", function () {

    if (visualonoff.checked) {
        tabs.style.display = 'grid';
        playersection.style.gridTemplateColumns = '1fr 1fr';
        playersection.style.maxWidth = '1170px';
        playersection.style.justifyContent = 'none';
        setWidthHeight();
    } else {
        tabs.style.display = 'none';
        playersection.style.gridTemplateColumns = '1fr';
        playersection.style.maxWidth = '900px';
        playersection.style.justifyContent = 'center';
        setWidthHeight();

    }

    localStorage.setItem('visualToggle', visualonoff.checked ? 'true' : 'false');
});

//remove all songs
const removeAll = document.getElementById("remove-all");
const deleteback = document.getElementById("delete-back");
const deletecard = document.getElementById("delete-warning");
const deleteagree = document.getElementById("agree-delete");
const deletecancel = document.getElementById("disagree-delete");

removeAll.addEventListener('click', function () {
    deleteback.style.display = 'block';
    deletecard.style.display = 'block';
});

deleteagree.addEventListener('click', function () {
    if (files.length > 0) {
        files = [];
        listItemMap.clear();
        updateIndicesAndMap();
        updatePlaylist();
        playlist.innerHTML = '';
        currentIndex = -1;
        localStorage.setItem('currentIndex', currentIndex);
        updateButtonsState(currentIndex);
        playPauseButton.innerHTML = playsvg;
        audioPlayer.src = '';
        updateSongName('Add songs to your playlist and let the music begin! 🎵✨');
        img.src = "./images/art.png";
        if (audioctx) audioctx.suspend();
        if (animation) window.cancelAnimationFrame(animation);
        const playlisttext = document.createElement('p');
        playlisttext.setAttribute("id", "playlist-text");
        playlisttext.innerHTML = `Playlist is empty... Add songs to start playing.<br>Can't find any songs? Try <a id="sample-music" title="Add sample music to the playlist." href="#" onclick="playsamplemusic(); return false;" >sample music</a>`;
        playlist.appendChild(playlisttext);
        document.querySelector(".play-pause-back").style.opacity = "0.5";
        document.querySelector(".searchbtn").style.opacity = "0.5";
        document.querySelector(".searchbtn").style.cursor = "not-allowed";
        playPauseButton.disabled = true;
        seekBar.disabled = true;
        removeAll.disabled = true;
        searchbtntext.disabled = true;
        repeatsong.disabled = true;
    }

    deleteback.style.display = 'none';
    deletecard.style.display = 'none';
});

deletecancel.addEventListener('click', function () {
    deleteback.style.display = 'none';
    deletecard.style.display = 'none';
});

const deleteblurback = document.getElementById("delete-back");

deleteblurback.addEventListener('click', function (e) {
    if (e.target === deleteblurback) {
        deleteback.style.display = 'none';
        deletecard.style.display = 'none';
    }
});


//search button
const playerhead = document.querySelector("#playerhead");
const addbtn = document.querySelector("#dropdownContainer");
const searchbtn = document.querySelector(".searchbtn");
const deletebtn = document.querySelector(".delbutton");
const searchbtntext = document.querySelector(".searchbtn span");
const searchinput = document.querySelector("#search-list");

const searchsvg = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-width="3" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
</svg>
`;

const closesvg = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18 17.94 6M18 18 6.06 6"/>
</svg>
`;

let search = false;
function closeserch() {
    playerhead.style["grid-template-columns"] = "1fr 1fr 1fr";
    addbtn.style.display = "flex";
    deletebtn.style.display = "flex";
    searchbtn.style["grid-template-columns"] = "1fr ";
    searchbtn.style["max-width"] = "150px";
    searchinput.style.display = "none";
    searchbtntext.innerHTML = searchsvg + "Search ";
    searchinput.value = "";
    if (document.getElementById('playlist-text')) {
        document.getElementById('playlist-text').remove();
    }
    let songs = document.querySelectorAll('#playlist li');
    songs.forEach((song) => {
        song.style.display = "grid";
    });
    document.querySelectorAll('.up, .down, .info').forEach(button => {
        button.style.display = 'flex';
    });
}

searchbtntext.addEventListener("click", function () {
    if (searchbtntext.disabled) {
        return;
    }
    search = !search;
    if (search) {
        playerhead.style["grid-template-columns"] = "1fr ";
        addbtn.style.display = "none";
        deletebtn.style.display = "none";
        searchbtn.style["grid-template-columns"] = "auto 90px";
        searchbtn.style["max-width"] = "none";
        searchinput.style.display = "flex";
        searchbtntext.innerHTML = closesvg + "Close";
        document.querySelectorAll('.up, .down, .info').forEach(button => {
            button.style.display = 'none';
        });
        scrollToTopPlaylist();
        searchsongs();
    }
    else {
        closeserch();
    }
});


//search songs
const searchinputbox = document.getElementById("search-list");

searchinputbox.addEventListener('input', function () {
    searchsongs();
});

function searchsongs() {
    let songs = document.querySelectorAll('#playlist li');
    if (document.getElementById('playlist-text')) {
        document.getElementById('playlist-text').remove();
    }
    const playlisttext = document.createElement('p');
    playlisttext.setAttribute("id", "playlist-text");
    var referenceLi = document.querySelector('#playlist li[data-index="0"]');
    if (referenceLi) {
        playlist.insertBefore(playlisttext, referenceLi);
    } else {
        playlist.appendChild(playlisttext);
    }
    let numsongs = 0;
    songs.forEach((song) => {
        if (searchinputbox.value === '') {
            song.style.display = 'grid';
        } else {
            if (song.textContent.toLowerCase().includes(searchinputbox.value.toLowerCase())) {
                song.style.display = 'grid';
                numsongs = numsongs + 1;

            } else {
                song.style.display = 'none';
            }
        }
    });
    if (numsongs === 0) {
        playlisttext.textContent = 'No songs found';
        if (searchinputbox.value === '') {
            playlisttext.textContent = 'Type to search...';
        }
    }
    else {
        playlisttext.textContent = numsongs + ' song/s found';

    }

}

//theme change
const themeSelect = document.getElementById("theme-select");

themeSelect.addEventListener("change", function () {
    const selectedTheme = themes[this.value];
    localStorage.setItem('selectedTheme', this.value);
    if (selectedTheme) {
        Object.keys(selectedTheme).forEach(key => {
            document.documentElement.style.setProperty(key, selectedTheme[key]);
        });
    }
});

//dark mode
const darkModeToggle = document.getElementById("darkmode-on-off");
darkModeToggle.addEventListener("change", function () {
    localStorage.setItem('darkModeEnabled', darkModeToggle.checked ? 'true' : 'false');
    setdarkmode();
});

setdarkmode();
function setdarkmode() {
    if (darkModeToggle.checked) {
        themeSelect.disabled = true;
        const dtheme = darktheme['dark'];
        Object.keys(dtheme).forEach(key => {
            document.documentElement.style.setProperty(key, dtheme[key]);
        });


    } else {
        themeSelect.disabled = false;
        const selectedTheme = themes[themeSelect.value];
        if (selectedTheme) {
            Object.keys(selectedTheme).forEach(key => {
                document.documentElement.style.setProperty(key, selectedTheme[key]);
            });
        }

    }
}

//party mode
const warn = document.getElementById("warning");
const warnback = document.getElementById("warning-back");
const agree = document.getElementById("agree");
const disagree = document.getElementById("disagree");

let firstclick = 0;
partytoggle.addEventListener("click", function () {
    if (firstclick === 0) {
        partytoggle.checked = false;
        warn.style.display = 'block';
        warnback.style.display = 'block';
    } else {
        if (partytoggle.checked) {
            const selectedTheme = themes[themeSelect.value];
            if (selectedTheme) {
                Object.keys(selectedTheme).forEach(key => {
                    document.documentElement.style.setProperty(key, selectedTheme[key]);
                });
            }
            themeSelect.disabled = true;
            darkModeToggle.checked = false;
            localStorage.setItem('darkModeEnabled', darkModeToggle.checked ? 'true' : 'false');
            darkModeToggle.disabled = true;

            startConfetti();
        }
        else {
            themeSelect.disabled = false;
            darkModeToggle.disabled = false;
            const selectedTheme = themes[themeSelect.value];
            if (selectedTheme) {
                Object.keys(selectedTheme).forEach(key => {
                    document.documentElement.style.setProperty(key, selectedTheme[key]);
                });
            }
            confettiRunning = false;
            if (confettiAnimationId) {
                cancelAnimationFrame(confettiAnimationId);
            }
        }
    }
});

agree.addEventListener("click", function () {
    firstclick = 1;
    partytoggle.checked = true;
    warn.style.display = 'none';
    warnback.style.display = 'none';
    themeSelect.disabled = true;
    darkModeToggle.checked = false;
    localStorage.setItem('darkModeEnabled', darkModeToggle.checked ? 'true' : 'false');
    darkModeToggle.disabled = true;
    const selectedTheme = themes[themeSelect.value];
    if (selectedTheme) {
        Object.keys(selectedTheme).forEach(key => {
            document.documentElement.style.setProperty(key, selectedTheme[key]);
        });
    }
    startConfetti();
});

disagree.addEventListener("click", function () {
    partytoggle.checked = false;
    warn.style.display = 'none';
    warnback.style.display = 'none';
});

const warnblurback = document.getElementById("warning-back");

warnblurback.addEventListener("click", function (e) {
    if (e.target === warnblurback) {
        partytoggle.checked = false;
        warn.style.display = 'none';
        warnback.style.display = 'none';
    }
});


