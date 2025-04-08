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

repeatsong.disabled = true;
randomsong.disabled = true;

let files = [];
let currentIndex = -1;
let listItemMap = new Map();
let isAudioConnected = false;

audioPlayer.volume = 0.5;

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
});

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


//visualizer and other effects

function audiovisual(player) {
    audio = player;
    audioctx = new AudioContext();
    setWidthHeight();

    if (!isAudioConnected) {

        audiosrc = audioctx.createMediaElementSource(audio);
        analyser = audioctx.createAnalyser();
        audiosrc.connect(analyser);
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

        panNode = new StereoPannerNode(audioctx);
        panNode.pan.value = 0;

        jungle.output.connect(filters[0]);

        filters[filters.length - 1].connect(panNode);
        panNode.connect(audioctx.destination);

    }
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let barWidth = (canvas1.width / bufferLength) * 1.5;
    let barHeight;
    let x;

    function animate1() {
        x = 0;
        ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
        let points = 300; // Number of points to draw
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < bufferLength; i++) {
            barHeight = Math.max(dataArray[i] / 2, 10);
            ctx1.fillStyle = generateRandomColor(dataArray[i]);
            ctx1.fillRect(x, canvas1.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }

        animation = requestAnimationFrame(animate1);
    }

    let hue = 0;
    function animate2() {
        // Clear the canvas
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

        // Get frequency data
        analyser.getByteFrequencyData(dataArray);

        // Set the background color
        ctx2.fillStyle = '#000'; // Black background
        ctx2.fillRect(0, 0, canvas2.width, canvas2.height);

        // Circle parameters
        let points = 300; // Number of points to draw
        let radius = 40; // Base radius
        let cX = canvas2.width / 2; // Center X
        let cY = canvas2.height / 2; // Center Y

        // Scaling factors for roundness
        let scaleX = canvas2.width / Math.max(canvas2.width, canvas2.height);
        let scaleY = canvas2.height / Math.max(canvas2.width, canvas2.height);

        // Calculate radians per data point
        let radianAdd = ((Math.PI * 6)) / dataArray.length; // Full circle
        let radian = 0;
        let radianc = 0;


        // Line styles
        ctx2.strokeStyle = "hsl(" + hue + ", 100%, 50%)";
        ctx2.lineWidth = 2;
        ctx2.lineCap = 'round';
        ctx2.lineJoin = 'round';

        // draw circle

        for (let i = 0; i < points; i++) {
            // Calculate starting point of the line
            let xStart = radius * Math.cos(radianc) * scaleX + cX;
            let yStart = radius * Math.sin(radianc) * scaleY + cY;

            // Clamp the data value
            let v = 30;

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
        for (let i = 10; i < dataArray.length - 10; i++) {
            // Calculate starting point of the line
            let xStart = radius * Math.cos(radian) * scaleX + cX;
            let yStart = radius * Math.sin(radian) * scaleY + cY;

            // Clamp the data value
            let v = Math.max(dataArray[i] / 2, radius);

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

        // Request the next animation frame
        animation = requestAnimationFrame(animate2);
    }
    const bubbles = []; // Array to hold bubble objects
    const numBubbles = 100; // Fixed number of bubbles

    // Initialize bubbles with random positions and sizes
    for (let i = 0; i < numBubbles; i++) {
        bubbles.push({
            x: Math.random() * canvas3.width,
            y: Math.random() * canvas3.height,
            radius: Math.random() * 20 + 10,
            dx: (Math.random() - 0.5) * 2, // Random horizontal velocity
            dy: (Math.random() - 0.5) * 2, // Random vertical velocity
            color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
    }

    function animate3() {
        ctx3.clearRect(0, 0, canvas3.width, canvas3.height);

        analyser.getByteFrequencyData(dataArray);

        bubbles.forEach((bubble, index) => {
            // Update bubble position
            bubble.x += bubble.dx;
            bubble.y += bubble.dy;

            // Bounce off edges
            if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > canvas3.width) {
                bubble.dx *= -1;
            }
            if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > canvas3.height) {
                bubble.dy *= -1;
            }

            // Update bubble size and color based on audio data
            const audioValue = dataArray[index % dataArray.length] / 255;
            bubble.radius = 5 + audioValue * 20;
            bubble.color = `hsl(${audioValue * 360}, 100%, 50%)`;

            // Draw bubble
            ctx3.beginPath();
            ctx3.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            ctx3.fillStyle = bubble.color;
            ctx3.fill();
        });

        // Request the next animation frame
        animation = requestAnimationFrame(animate3);
    }

    let lastThemeUpdate = 0;
    let themeUpdateInterval = 200; // update theme every 0.5 seconds max

    function animate4() {

        if (partytoggle.checked) {
            let now = Date.now();
            if (now - lastThemeUpdate > themeUpdateInterval) {
                partyTheme();
                lastThemeUpdate = now;
            }
        }

        animation = requestAnimationFrame(animate4);
    }

    function partyTheme() {
        if (dataArray.length === 0) return; // handle empty data
        let avg = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        console.log("Average:", avg);

        const themeKeys = Object.keys(themes);
        let themeIndex = Math.floor(avg) % themeKeys.length;
        console.log("Theme Index:", themeIndex);

        const selectedThemeKey = themeKeys[themeIndex];
        const selectedTheme = themes[selectedThemeKey];
        console.log("Selected Theme:", selectedThemeKey);


        if (selectedTheme) {
            Object.keys(selectedTheme).forEach(key => {
                document.documentElement.style.setProperty(key, selectedTheme[key]);
            });
        }

    }

    animate1();
    animate2();
    animate3();
    animate4();
}

//generate random color
function generateRandomColor(barHeight) {
    // Ensure barHeight is within a reasonable range
    barHeight = Math.max(0, Math.min(255, barHeight));

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

    // Update the text content
    songNameElement.textContent = newText;

    document.querySelector(".marquee").style.width = maqcontainer + 'px';

    // Reset animation
    songNameElement.style.animation = "none";

    // Wait for a reflow to apply the animation again
    void songNameElement.offsetWidth;

    // Calculate the animation duration based on text width
    const containerWidth = document.querySelector(".marquee").offsetWidth;
    const textWidth = songNameElement.offsetWidth;
    const animationDuration = (textWidth + containerWidth) / 100; // Adjust speed factor as needed

    // Apply the new animation with dynamic duration
    songNameElement.style.animation = `marquee ${animationDuration}s linear infinite`;

}

repeatsong.addEventListener('change', () => {
    if (repeatsong.checked) {
        // Checkbox is checked
        randomsong.checked = false;
    }

});
randomsong.addEventListener('change', () => {
    if (randomsong.checked) {
        // Checkbox is checked
        repeatsong.checked = false;
    }
});

function showerror(message) {
    const error = document.querySelector('#error');
    const errorText = document.querySelector('#error .message');
    errorText.textContent = message;
    error.style.display = 'block';
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

        // Call necessary update functions
        updatePlaylist();
        setWidthHeight();
        updateButtonsState(currentIndex);
        audiovisual(audioPlayer);
        fileInput.value = ''; // Reset the input value to allow selecting the same file again

        // Handle edge case when no file is playing
        if (currentIndex === -1 && files.length > 0) {
            playFile(0);
        }
    } catch (error) {
        console.error('An error occurred while processing the file input:', error.message);
        showerror(error.message);
        fileInput.value = ''; // Clear the input on error
    }
});



function updatePlaylist() {
    playlist.innerHTML = '';
    listItemMap.clear();
    files.forEach((file, index) => {
        const listItem = document.createElement('li');
        const listItemtext = document.createElement('p');
        listItemtext.textContent = file.name;
        listItemtext.textContent = listItemtext.textContent.replace(/_/g, " ");
        listItem.setAttribute('data-index', index);

        const removeButton = document.createElement('button');
        removeButton.classList.add('remove');
        const removeButtonspan = document.createElement('span');
        removeButtonspan.classList.add('removespan');
        removeButtonspan.textContent = 'Remove';
        const removeButtonicon = document.createElement('span');
        removeButtonicon.classList.add('removeicon');
        removeButtonicon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"></path></svg>`;

        removeButton.appendChild(removeButtonspan);
        removeButton.appendChild(removeButtonicon);
        listItem.appendChild(listItemtext);
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
    if (files.length > 0) {
        repeatsong.disabled = false;
    }
    if (files.length < 2) {
        randomsong.disabled = true;
    } else if (files.length > 1) {
        randomsong.disabled = false;
    }
}

function handleRemoveFile(index) {
    const listItem = listItemMap.get(index);
    listItem.remove();


    if (index === currentIndex) {
        audioPlayer.pause();

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
            updateSongName('Add songs to playlist...');

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

function playFile(index) {
    if (index >= 0 && index < files.length) {
        const fileURL = URL.createObjectURL(files[index]);
        audioPlayer.src = fileURL;
        audioPlayer.currentTime = 0; // Reset current time to 0
        audioPlayer.play();
        playPauseButton.innerHTML = pausesvg;
        updatePlaylistHighlight(index);
        updateButtonsState(index);
        currentIndex = index;
        audioctx.resume();
        audiovisual(audioPlayer);
        const file = files[index];

        const songTitle = file.name.replace('.mp3', '');
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
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseButton.innerHTML = pausesvg;
        audioctx.resume();
        audiovisual(audioPlayer);

    } else {
        audioPlayer.pause();
        playPauseButton.innerHTML = playsvg;
        if (audioctx) audioctx.suspend();
        if (animation) window.cancelAnimationFrame(animation);

    }
});

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
        var randomIndex = Math.floor(Math.random() * files.length);
        while (randomIndex === currentIndex) {
            randomIndex = Math.floor(Math.random() * files.length);
        }
        playFile(randomIndex);
    }
    else if (currentIndex < files.length - 1) {
        playFile(currentIndex + 1);
    } else {
        playPauseButton.innerHTML = playsvg;
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

});

speedreset.addEventListener("click", function () {
    speedControl.value = 1;
    audioPlayer.playbackRate = 1;
    speedlablel.textContent = '1x';
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
    slider.type = 'range';
    slider.orient = 'vertical';
    slider.style.direction = 'rtl';
    slider.style.writingMode = 'vertical-lr';
    slider.style.width = '10%';
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
    stereoLabel1.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + -stereoValue;
    stereoLabel2.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + stereoValue;

});

// Event listener for pitch reset
stereoRest.addEventListener("click", function () {
    stereoControl.value = 0;
    if (panNode) {
        panNode.pan.value = 0;
    }
    stereoLabel1.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + 0;
    stereoLabel2.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + 0;

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
        playersection.style.maxWidth = '1000px';        
        playersection.style.justifyContent = 'center';
        setWidthHeight();

    }
});

//remove all songs
const removeAll = document.getElementById("remove-all");

removeAll.addEventListener('click', function () {
    if (files.length > 0) {
        files = [];
        listItemMap.clear();
        updateIndicesAndMap();
        updatePlaylist();
        playlist.innerHTML = '';
        currentIndex = -1;
        playPauseButton.innerHTML = playsvg;
        audioPlayer.src = '';
        updateSongName('Add songs to playlist...');
        img.src = "./images/art.png";
        if (audioctx) audioctx.suspend();
        if (animation) window.cancelAnimationFrame(animation);
    }
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

searchbtntext.addEventListener("click", function () {
    search = !search;
    if (search) {
        playerhead.style["grid-template-columns"] = "1fr ";
        addbtn.style.display = "none";
        deletebtn.style.display = "none";
        searchbtn.style["grid-template-columns"] = "auto 90px";
        searchbtn.style["max-width"] = "none";
        searchinput.style.display = "flex";
        searchbtntext.innerHTML = closesvg + "Close";

    }
    else {
        playerhead.style["grid-template-columns"] = "1fr 1fr 1fr";
        addbtn.style.display = "flex";
        deletebtn.style.display = "flex";
        searchbtn.style["grid-template-columns"] = "1fr ";
        searchbtn.style["max-width"] = "150px";
        searchinput.style.display = "none";
        searchbtntext.innerHTML = searchsvg + "Search ";
        searchinput.value = "";
        document.getElementById("playlist-text").remove();
        let songs = document.querySelectorAll('#playlist li');
        songs.forEach((song) => {
            song.style.display = "grid";
        });
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
        "--menu-color": " #9a8c98",
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
        "--black": " #ffffff",
        "--white": " #121212",
        "--menu-color": " #000000",
        "--home-c1-color": " #3700b3",
        "--home-c2-color": " #03dac6",
        "--home-c3-color": " #bb86fc",
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
        "--settings-text-color": " #ffffff",
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

const partytoggle = document.getElementById("party-on-off");
const warn = document.getElementById("warning");
const agree = document.getElementById("agree");
const disagree = document.getElementById("disagree");

let firstclick = 0;
partytoggle.addEventListener("click", function () {
    if (firstclick === 0) {
        partytoggle.checked = false;
        warn.style.display = 'block';
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
});




