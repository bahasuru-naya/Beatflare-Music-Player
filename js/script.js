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
    // Optionally, update the canvas height on window resize
    window.addEventListener('resize', setWidthHeight);
    const playlisttext = document.createElement('p');
    playlisttext.setAttribute("id", "playlist-text");
    playlisttext.innerHTML = `Playlist is empty... Add songs to start playing.<br>Can't find any songs? Try <a id="sample-music" title="Add sample music to the playlist." href="#" onclick="playsamplemusic(); return false;" >sample music</a>.`;
    playlist.appendChild(playlisttext);
    document.querySelector(".play-pause-back").style.opacity = "0.5";
    document.querySelector(".cssbuttons-io").style.opacity = "0.5";
    document.querySelector(".cssbuttons-io").style.cursor = "not-allowed";
    playPauseButton.disabled = true;
    seekBar.disabled = true;
    removeAll.disabled = true;
    searchbtntext.disabled = true;
    audiovisual(audioPlayer);
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
            document.querySelector(".cssbuttons-io").style.opacity = "1";
            document.querySelector(".cssbuttons-io").style.cursor = "pointer";
            playPauseButton.disabled = false;
            seekBar.disabled = false;
            removeAll.disabled = false;
            searchbtntext.disabled = false;

            // Call necessary update functions
            updatePlaylist();
            setWidthHeight();
            currentIndex = 0; // Reset currentIndex to 0
            updateButtonsState(currentIndex);
            audiovisual(audioPlayer);
            fileInput.value = '';
            updatePlaylistHighlight(currentIndex);
            const file = files[currentIndex];
            const songTitle = file.name.replace('.mp3', '');
            const fileURL = URL.createObjectURL(files[currentIndex]);
            audioPlayer.src = fileURL;
            audioPlayer.currentTime = 0; // Reset current time to 0
            audioPlayer.playbackRate = parseFloat(speed);
            audioPlayer.pause();
            playPauseButton.innerHTML = playsvg;
            // Display the song name in the marquee        
            updateSongName(`Paused: ${songTitle}`);
            if (audioctx) audioctx.suspend();
            if (animation) window.cancelAnimationFrame(animation);
            restoreActiveIndexText();

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

    // Reset animation
    songNameElement.style.animation = "none";

    // Calculate the animation duration based on text width
    const containerWidth = maqcontainer;
    const textWidth = songNameElement.offsetWidth;
    const animationDuration = (textWidth + containerWidth) / 100; // Adjust speed factor as needed

    // Apply the new animation with dynamic duration
    songNameElement.style.animation = `marquee ${animationDuration}s linear infinite`;

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
                barHeight = Math.max(dataArray[i] * 1.2, 2);
                ctx1.fillStyle = generateRandomColor(dataArray[i]);
                ctx1.fillRect(x, canvas1.height - barHeight, barWidth, barHeight);
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
            let points = 200; // Number of points to draw circle
            let radius = 50; // Base radius
            const numlines = 43; // Number of lines to draw visualizer
            let cX = canvas2.width / 2; // Center X
            let cY = canvas2.height / 2; // Center Y

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

        // Request the next animation frame
        animation = requestAnimationFrame(animate2);
    }

    // --- Circle Animation ---

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

                    // --- MODIFIED: Add the startAngleOffset to the angle calculation ---
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
    let themeUpdateInterval = 300; // update theme every 0.3 seconds 

    function animate4() {
        if (partytoggle.checked) {

            now = Date.now();
            if (now - lastThemeUpdate > themeUpdateInterval) {
                partyTheme();
                lastThemeUpdate = now;
                if (!audioPlayer.paused) {
                    const end = Date.now() + 50;
                    (function frame() {

                        confetti({
                            particleCount: 2,
                            angle: 60,
                            spread: 55,
                            origin: { x: 0 },

                        });

                        confetti({
                            particleCount: 2,
                            angle: 120,
                            spread: 55,
                            origin: { x: 1 },

                        });

                        if ((Date.now() < end)) {
                            requestAnimationFrame(frame);
                        }

                    })();
                } else {
                    const selectedTheme = themes[themeSelect.value];
                    if (selectedTheme) {
                        Object.keys(selectedTheme).forEach(key => {
                            document.documentElement.style.setProperty(key, selectedTheme[key]);
                        });
                    }

                }

            }
        }
        animation = requestAnimationFrame(animate4);
    }


    function partyTheme() {
        if (dataArray.length === 0) return; // handle empty data
        let sum = dataArray.reduce((sum, value) => sum + value, 0);
        let average = sum / dataArray.length;

        //console.log("Average:", average);

        const themeKeys = Object.keys(themes);
        let themeIndex = (Math.floor(average) % (themeKeys.length * 100)) % themeKeys.length;
        //console.log("Theme Index:", themeIndex);       

        const selectedThemeKey = themeKeys[themeIndex];
        const selectedTheme = themes[selectedThemeKey];
        //console.log("Selected Theme:", selectedThemeKey); 

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

//generate random color
function generateRandomColor(barHeight) {
    if (barHeight === undefined || barHeight === null) {
        barHeight = 0;
    }
    else {
        // Ensure barHeight is within a reasonable range
        barHeight = Math.max(0, Math.min(255, barHeight));
    }

    // Use barHeight to influence hue and convert HSL to RGB for rainbow effect
    let hue = (barHeight * 1.5 + Math.floor(Math.random() * 60)) % 360; // create variation
    let saturation = 90; // full saturation for bright rainbow colors
    let lightness = 40; // balanced lightness

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
        const songTitle = parts.slice(1).join(':').trim(); // handle cases with multiple colons

        // Create link for the song name
        songNameElement.innerHTML = `${prefix} <a id="currentsonglink" title="Scroll playlist to now playing" href="#" onclick="scrollToActive(); return false;">${songTitle}</a>`;
    } else {
        // No colon, just set the text
        songNameElement.textContent = newText;
    }

    document.querySelector(".marquee").style.width = maqcontainer + 'px';

    // Reset animation
    songNameElement.style.animation = "none";

    // Wait for a reflow to apply the animation again
    void songNameElement.offsetWidth;

    // Calculate the animation duration based on text width
    const containerWidth = document.querySelector(".marquee").offsetWidth;
    const textWidth = songNameElement.offsetWidth;
    const animationDuration = (textWidth + containerWidth) / 90; // Adjust speed factor as needed

    // Apply the new animation with dynamic duration
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
        activeItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest' // Or 'center' or 'start'
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
        // Checkbox is checked
        randomsong.checked = false;
    }

});

const playedrandomArray = [];

randomsong.addEventListener('change', () => {
    if (randomsong.checked) {
        // Checkbox is checked
        repeatsong.checked = false;
    }
    else {
        playedrandomArray = [];
    }
});

function showerror(message) {
    const error = document.querySelector('#error');
    const errorBack = document.querySelector('#error-back');
    const errorText = document.querySelector('#error .message');
    errorText.textContent = message;
    error.style.display = 'block';
    errorBack.style.display = 'block';
}

function playsamplemusic() {
    const sampleFileNames = ['angelsbymyside.mp3', 'Welcome to Beatflare.mp3'];
    const folderPath = '../sample-music/';

    const fetchPromises = sampleFileNames.map(fileName => {
        const fileUrl = folderPath + fileName;
        return fetch(fileUrl)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load ${fileName}`);
                return response.blob();
            })
            .then(blob => new File([blob], fileName, { type: blob.type }));
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
            document.querySelector(".cssbuttons-io").style.opacity = "1";
            document.querySelector(".cssbuttons-io").style.cursor = "pointer";
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
            scrollToBottomPlaylist();
        })
        .catch(err => {
            console.error('An error occurred while processing the file input:', err.message);
            showerror(err.message);
            fileInput.value = '';
        })
        .finally(() => {
            if (currentIndex === -1 && files.length > 0) {
                playFile(0);
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
        document.querySelector(".cssbuttons-io").style.opacity = "1";
        document.querySelector(".cssbuttons-io").style.cursor = "pointer";
        playPauseButton.disabled = false;
        seekBar.disabled = false;
        removeAll.disabled = false;
        searchbtntext.disabled = false;

        // Call necessary update functions
        updatePlaylist();
        setWidthHeight();
        updateButtonsState(currentIndex);
        audiovisual(audioPlayer);
        fileInput.value = ''; // Reset the input value to allow selecting the same file again
        scrollToBottomPlaylist();

    } catch (error) {
        console.error('An error occurred while processing the file input:', error.message);
        showerror(error.message);
        fileInput.value = ''; // Clear the input on error
    }

    // Handle edge case when no file is playing
    if (currentIndex === -1 && files.length > 0) {
        playFile(0);
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

        if (index !== 0) {
            const upbutton = document.createElement("button");
            upbutton.classList.add("up");
            // Create the SVG element (as innerHTML)
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
            // Create the SVG element (as innerHTML)
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
        removeButton.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
        </svg>`;

        listItem.appendChild(removeButton);

        listItem.addEventListener('click', () => playFile(index));
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

        } else if (currentIndex === index - 1) {
            currentIndex++;

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

        } else if (currentIndex === index + 1) {
            currentIndex--;

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
            playPauseButton.innerHTML = playsvg;
            audioPlayer.src = '';
            img.src = "./images/art.png";
            updateSongName('Add songs to your playlist and let the music begin! 🎵✨');
            search = false;
            closeserch();
            const playlisttext = document.createElement('p');
            playlisttext.setAttribute("id", "playlist-text");
            playlisttext.innerHTML = `Playlist is empty... Add songs to start playing.<br>Can't find any songs? Try <a id="sample-music" title="Add sample music to the playlist." href="#" onclick="playsamplemusic(); return false;" >sample music</a>.`;
            playlist.appendChild(playlisttext);
            document.querySelector(".play-pause-back").style.opacity = "0.5";
            document.querySelector(".cssbuttons-io").style.opacity = "0.5";
            document.querySelector(".cssbuttons-io").style.cursor = "not-allowed";
            playPauseButton.disabled = true;
            seekBar.disabled = true;
            removeAll.disabled = true;
            searchbtntext.disabled = true;
            repeatsong.disabled = true;


        } else {
            // Determine the next or previous file to play
            if (index < files.length - 1) {
                currentIndex = index; // Play the next file
            } else {
                currentIndex = index - 1; // Play the previous file
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

var missingFileTitles = [];

//close error msg
document.querySelector('#error_ok').addEventListener('click', function () {
    document.querySelector('#error').style.display = 'none';
    document.querySelector('#error-back').style.display = 'none';
    missingFileTitles = []
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
        audioPlayer.currentTime = 0; // Reset current time to 0
        audioPlayer.playbackRate = parseFloat(speed);
        currentIndex = index;

        audioPlayer.play()
            .then(() => {
                playPauseButton.innerHTML = pausesvg;
                updatePlaylistHighlight(index);
                updateButtonsState(index);
                audioctx.resume();
                audiovisual(audioPlayer);
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
        audioctx.resume();
        audiovisual(audioPlayer);
        replaceActiveWithLoading();


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
    audioctx.resume();
    audiovisual(audioPlayer);
    replaceActiveWithLoading();

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

});

speedreset.addEventListener("click", function () {
    speedControl.value = 1;
    audioPlayer.playbackRate = 1;
    speedlablel.textContent = '1x';
    speed = 1;
});


//change audio pitch
const pitchControl = document.getElementById("pitch");
const pitchLabel = document.getElementById("pitchlabel");
const pitchRest = document.getElementById("pitch-reset");


// Event listener for pitch control
pitchControl.addEventListener("input", function () {
    const pitchValue = parseFloat(this.value);
    if (jungle) {
        jungle.setPitchTranspose(0, pitchValue);
    }
    pitchLabel.textContent = pitchValue + "x";

});

// Event listener for pitch reset
pitchRest.addEventListener("click", function () {
    pitchControl.value = 0;
    if (jungle) {
        jungle.setPitchTranspose(0, 0);
    }
    pitchLabel.textContent = "0x";
});

//equlizer
const equSelect = document.getElementById("equ-select");

const sliders = eqBands.map((freq, idx) => {  // Use 'idx' instead of 'index'
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
            filters[idx].gain.value = parseFloat(event.target.value);// Use 'idx' correctly here            

        }
        slidervlabel.textContent = parseFloat(event.target.value) + ' dB';
        equSelect.value = 'Custom';
    });
    slider.addEventListener('change', (event) => {
        if (filters) {
            filters[idx].gain.value = parseFloat(event.target.value);// Use 'idx' correctly here            
        }
        slidervlabel.textContent = parseFloat(event.target.value) + ' dB';
        equSelect.value = 'Custom';
    });
    divslider.appendChild(slidervlabel);
    divslider.appendChild(slider);
    divslider.appendChild(sliderlabel);
    eqcontainer.appendChild(divslider);
    return slider;
});

const eqreset = document.getElementById("equalizer-reset");
const eqlablels = document.querySelectorAll(".sliderlabelvalue");

eqreset.addEventListener("click", function () {
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
    "Custom": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] // Custom values will be set manually
};

document.querySelector("#equ-select option[value='Custom']").style.display = "none";

equSelect.addEventListener("change", function () {
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
});

//stereo change
const stereoControl = document.getElementById("Stereo");
const stereoLabel1 = document.getElementById("Stereolabel1");
const stereoLabel2 = document.getElementById("Stereolabel2");
const stereoRest = document.getElementById("Stereo-reset");


// Event listener for pitch control
stereoControl.addEventListener("input", function () {
    const stereoValue = parseFloat(this.value);
    if (panNode) {
        panNode.pan.value = stereoValue;
    }
    // Update the labels with the new stereo values
    const stereoValue1 = 1 + (-stereoValue);
    const stereoValue2 = 1 + stereoValue;
    stereoLabel1.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + stereoValue1.toFixed(1);
    stereoLabel2.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + stereoValue2.toFixed(1);

});

// Event listener for pitch reset
stereoRest.addEventListener("click", function () {
    stereoControl.value = 0;
    if (panNode) {
        panNode.pan.value = 0;
    }
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

lowpassControlF.addEventListener("input", function () {
    const lowpassValue = parseFloat(this.value);
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

lowpassControlQ.addEventListener("input", function () {
    const lowpassValueQ = parseFloat(this.value);
    if (lowfilter) {
        lowfilter.Q.value = lowpassValueQ * QUAL_MUL;
    }
    lowpassLabelQ.textContent = (lowpassValueQ * QUAL_MUL).toFixed(2);
}
);

lowpassreset.addEventListener("click", function () {
    lowpassControlF.value = 1;
    lowpassControlQ.value = 0;
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

highpassControlF.addEventListener("input", function () {
    const highpassValue = parseFloat(this.value);
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

highpassControlQ.addEventListener("input", function () {
    const highpassValueQ = parseFloat(this.value);
    if (highfilter) {
        highfilter.Q.value = highpassValueQ * QUAL_MUL2;
    }
    highpassLabelQ.textContent = (highpassValueQ * QUAL_MUL2).toFixed(2);
}
);

highpassreset.addEventListener("click", function () {
    highpassControlF.value = 0;
    highpassControlQ.value = 0;
    if (highfilter) {
        highfilter.frequency.value = 20;
        highfilter.Q.value = 0;
    }
    highpassLabelF.textContent = "20.00Hz";
    highpassLabelQ.textContent = "0.00";
}
);


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
        updateButtonsState(currentIndex);
        playPauseButton.innerHTML = playsvg;
        audioPlayer.src = '';
        updateSongName('Add songs to your playlist and let the music begin! 🎵✨');
        img.src = "./images/art.png";
        if (audioctx) audioctx.suspend();
        if (animation) window.cancelAnimationFrame(animation);
        const playlisttext = document.createElement('p');
        playlisttext.setAttribute("id", "playlist-text");
        playlisttext.innerHTML = `Playlist is empty... Add songs to start playing.<br>Can't find any songs? Try <a id="sample-music" title="Add sample music to the playlist." href="#" onclick="playsamplemusic(); return false;" >sample music</a>.`;
        playlist.appendChild(playlisttext);
        document.querySelector(".play-pause-back").style.opacity = "0.5";
        document.querySelector(".cssbuttons-io").style.opacity = "0.5";
        document.querySelector(".cssbuttons-io").style.cursor = "not-allowed";
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


//search button

const playerhead = document.querySelector("#playerhead");
const addbtn = document.querySelector(".buttonadd");
const searchbtn = document.querySelector(".cssbuttons-io");
const deletebtn = document.querySelector(".delbutton");
const searchbtntext = document.querySelector(".cssbuttons-io span");
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
    document.querySelectorAll('.up, .down').forEach(button => {
        button.style.display = 'flex';
    });
}

searchbtntext.addEventListener("click", function () {
    if (searchbtntext.disabled) {
        return; // Prevent action if the button is disabled
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
        document.querySelectorAll('.up, .down').forEach(button => {
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
            playlisttext.textContent = 'Type to search';
        }

    }
    else {
        playlisttext.textContent = numsongs + ' song/s found';

    }

}

//theme change

const themes = {
    default: {
        "--black": "rgb(46, 36, 30)",
        "--white": " #ffffff",
        "--menu-color": " #463f3a",
        "--menu-text-color": " #ffffff",
        "--home-c1-color": " #97766c",
        "--home-c2-color": " #e6b2a3",
        "--home-c3-color": " #8a817c",
        "--home-c4-color": " #bcb8b1",
        "--player-back-color": " #f4f3ee",
        "--player-text-color": " #000000",
        "--player-tab-back-color": " #E3CAA5",
        "--player-tab-text-color": " #000000",
        "--player-tab-active-back-color": " #bcb8b1",
        "--player-tab-active-text-color": " #000000",
        "--settings-back-color": " #e0afa0",
        "--settings-head-text-color": " #000000",
        "--settings-text-color": " #000000",
        "--about-back-color": " #AD8B73",
        "--about-text-color": " #302b28",
    },
    ocean: {
        "--black": " #003049",
        "--white": " #eae2b7",
        "--menu-color": " #0077b6",
        "--home-c1-color": " #0096c7",
        "--home-c2-color": " #00b4d8",
        "--home-c3-color": " #48cae4",
        "--home-c4-color": " #90e0ef",
        "--player-back-color": " #caf0f8",
        "--settings-back-color": " #ade8f4",
        "--about-back-color": " #023e8a",
        "--menu-text-color": " #ffffff",
        "--player-text-color": " #003049",
        "--player-tab-back-color": " #0096c7",
        "--player-tab-text-color": " #003049",
        "--player-tab-active-back-color": "rgb(163, 231, 245)",
        "--player-tab-active-text-color": " #003049",
        "--settings-head-text-color": " #003049",
        "--settings-text-color": " #003049",
        "--about-text-color": " #eae2b7"
    },
    sunset: {
        "--black": " #370617",
        "--white": " #ffba08",
        "--menu-color": " #f48c06",
        "--home-c1-color": " #e85d04",
        "--home-c2-color": " #dc2f02",
        "--home-c3-color": " #9d0208",
        "--home-c4-color": " #6a040f",
        "--player-back-color": "rgb(253, 98, 64)",
        "--settings-back-color": " #c70039",
        "--about-back-color": " #900c3f",
        "--menu-text-color": " #000000",
        "--player-text-color": " #370617",
        "--player-tab-back-color": " #e85d04",
        "--player-tab-text-color": " #370617",
        "--player-tab-active-back-color": " #ff5733",
        "--player-tab-active-text-color": " #370617",
        "--settings-head-text-color": " #370617",
        "--settings-text-color": " #370617",
        "--about-text-color": " #ffba08"
    },
    forest: {
        "--black": " #1b4332",
        "--white": " #fefae0",
        "--menu-color": " #2d6a4f",
        "--home-c1-color": " #40916c",
        "--home-c2-color": " #52b788",
        "--home-c3-color": " #74c69d",
        "--home-c4-color": " #95d5b2",
        "--player-back-color": " #b7e4c7",
        "--settings-back-color": " #d8f3dc",
        "--about-back-color": " #043f2b",
        "--menu-text-color": " #ffffff",
        "--player-text-color": " #1b4332",
        "--player-tab-back-color": " #40916c",
        "--player-tab-text-color": " #fefae0",
        "--player-tab-active-back-color": "rgb(151, 226, 177)",
        "--player-tab-active-text-color": " #1b4332",
        "--settings-head-text-color": " #1b4332",
        "--settings-text-color": " #1b4332",
        "--about-text-color": " #fefae0"
    },
    lavender: {
        "--black": " #3d348b",
        "--white": " #fdf7fa",
        "--menu-color": "rgb(93, 31, 112)",
        "--home-c1-color": " #c77dff",
        "--home-c2-color": " #f3c4fb",
        "--home-c3-color": " #d8b4e2",
        "--home-c4-color": " #b185db",
        "--player-back-color": "rgb(224, 176, 252)",
        "--settings-back-color": " #dee2ff",
        "--about-back-color": " #6a0572",
        "--menu-text-color": " #ffffff",
        "--player-text-color": " #3d348b",
        "--player-tab-back-color": " #c77dff",
        "--player-tab-text-color": " #3d348b",
        "--player-tab-active-back-color": "rgb(214, 149, 251)",
        "--player-tab-active-text-color": " #3d348b",
        "--settings-head-text-color": " #3d348b",
        "--settings-text-color": " #3d348b",
        "--about-text-color": " #fdf7fa"
    },
    neon: {
        "--black": " #0d0d0d",
        "--white": " #ffffff",
        "--menu-color": " #ff007f",
        "--home-c1-color": " #ff00ff",
        "--home-c2-color": " #ff5733",
        "--home-c3-color": " #00ff00",
        "--home-c4-color": " #00ffff",
        "--player-back-color": " #ffcc00",
        "--settings-back-color": " #6600ff",
        "--about-back-color": " #ff0066",
        "--menu-text-color": " #000000",
        "--player-text-color": " #0d0d0d",
        "--player-tab-back-color": " #ff007f",
        "--player-tab-text-color": " #ffffff",
        "--player-tab-active-back-color": " #00ffff",
        "--player-tab-active-text-color": " #0d0d0d",
        "--settings-head-text-color": " #ffffff",
        "--settings-text-color": " #ffffff",
        "--about-text-color": " #ffffff"

    },
    royal: {
        "--black": "rgb(59, 58, 0)",
        "--white": " #f0e68c",
        "--menu-color": "rgb(228, 194, 0)",
        "--home-c1-color": " #b8860b",
        "--home-c2-color": " #daa520",
        "--home-c3-color": " #f4a460",
        "--home-c4-color": " #ffdead",
        "--player-back-color": "rgb(220, 188, 83)",
        "--settings-back-color": " #b9aa0b",
        "--about-back-color": " #5a3e1b",
        "--menu-text-color": " #000000",
        "--player-text-color": " #1a1a1d",
        "--player-tab-back-color": " #b8860b",
        "--player-tab-text-color": " #1a1a1d",
        "--player-tab-active-back-color": " #d4af37",
        "--player-tab-active-text-color": " #1a1a1d",
        "--settings-head-text-color": " #1a1a1d",
        "--settings-text-color": " #1a1a1d",
        "--about-text-color": " #f0e68c"
    },
    pastel: {
        "--black": " #353a43",
        "--white": " #edf2f4",
        "--menu-color": "rgb(172, 114, 135)",
        "--home-c1-color": "rgb(249, 130, 176)",
        "--home-c2-color": "rgb(164, 212, 255)",
        "--home-c3-color": "rgb(124, 189, 250)",
        "--home-c4-color": "rgb(196, 150, 222)",
        "--player-back-color": "rgb(249, 133, 162)",
        "--settings-back-color": " #ff9a8b",
        "--about-back-color": " #ff758f",
        "--menu-text-color": " #000000",
        "--player-text-color": " #353a43",
        "--player-tab-back-color": " #ffc8dd",
        "--player-tab-text-color": "rgb(53, 57, 65)",
        "--player-tab-active-back-color": "rgb(227, 109, 139)",
        "--player-tab-active-text-color": " #ffffff",
        "--settings-head-text-color": " #353a43",
        "--settings-text-color": " #353a43",
        "--about-text-color": " #edf2f4"
    },
    midnight: {
        "--black": "rgb(22, 19, 48)",
        "--white": " #f4f3ee",
        "--menu-color": " #3d348b",
        "--home-c1-color": " #5d5d81",
        "--home-c2-color": "rgb(48, 48, 75)",
        "--home-c3-color": " #4a4e69",
        "--home-c4-color": " #9a8c98",
        "--player-back-color": "rgb(72, 70, 75)",
        "--settings-back-color": "rgb(68, 74, 47)",
        "--about-back-color": " #1a2a4d",
        "--menu-text-color": " #ffffff",
        "--player-text-color": " #f4f3ee",
        "--player-tab-back-color": " #5d5d81",
        "--player-tab-text-color": " #0a0908",
        "--player-tab-active-back-color": " #22223b",
        "--player-tab-active-text-color": " #ffffff",
        "--settings-head-text-color": "rgb(255, 255, 255)",
        "--settings-text-color": "rgb(255, 255, 255)",
        "--about-text-color": " #f4f3ee"
    },
    retro: {
        "--black": " #2e294e",
        "--white": " #ffefd5",
        "--menu-color": " #ff9f1c",
        "--home-c1-color": " #ff595e",
        "--home-c2-color": " #ffca3a",
        "--home-c3-color": " #8ac926",
        "--home-c4-color": " #1982c4",
        "--player-back-color": " #6a4c93",
        "--settings-back-color": " #c77dff",
        "--about-back-color": " #6d5868",
        "--menu-text-color": " #000000",
        "--player-text-color": " #ffefd5",
        "--player-tab-back-color": " #ffca3a",
        "--player-tab-text-color": " #2e294e",
        "--player-tab-active-back-color": " #ff595e",
        "--player-tab-active-text-color": " #ffffff",
        "--settings-head-text-color": " #2e294e",
        "--settings-text-color": " #2e294e",
        "--about-text-color": " #ffefd5"
    }
};

const themeSelect = document.getElementById("theme-select");

themeSelect.addEventListener("change", function () {
    const selectedTheme = themes[this.value];
    if (selectedTheme) {
        Object.keys(selectedTheme).forEach(key => {
            document.documentElement.style.setProperty(key, selectedTheme[key]);
        });
    }
});


//dark mode
const darktheme = {
    dark: {
        "--black": "rgb(244, 242, 242)",
        "--white": " #121212",
        "--menu-color": " #000000",
        "--home-c1-color": " #3700b3",
        "--home-c2-color": " #03dac6",
        "--home-c3-color": "rgb(166, 99, 249)",
        "--home-c4-color": " #6200ee",
        "--player-back-color": " #333333",
        "--settings-back-color": " #444444",
        "--about-back-color": " #222222",
        "--menu-text-color": " #ffffff",
        "--player-text-color": " #ffffff",
        "--player-tab-back-color": " #555555",
        "--player-tab-text-color": " #ffffff",
        "--player-tab-active-back-color": " #4b4646",
        "--player-tab-active-text-color": " #ffffff",
        "--settings-head-text-color": " #ffffff",
        "--settings-text-color": "rgb(238, 237, 237)",
        "--about-text-color": " #ffffff",
    },
};

const darkModeToggle = document.getElementById("darkmode-on-off");
darkModeToggle.addEventListener("change", function () {
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
            darkModeToggle.disabled = true;


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
    darkModeToggle.disabled = true;
    const selectedTheme = themes[themeSelect.value];
    if (selectedTheme) {
        Object.keys(selectedTheme).forEach(key => {
            document.documentElement.style.setProperty(key, selectedTheme[key]);
        });
    }

});

disagree.addEventListener("click", function () {
    partytoggle.checked = false;
    warn.style.display = 'none';
    warnback.style.display = 'none';
});




