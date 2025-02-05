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
    console.log(playerWidth);    
    if (playerWidth >= 800) {
        acontrol.style.display = 'inline-flex';
        playlist.style.height ='300px';
    }
    else {
        acontrol.style.display = 'block';
        playlist.style.height ='250px';
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


        jungle.output.connect(filters[0]);
        //audiosrc.connect(filters[0]);
        filters[filters.length - 1].connect(audioctx.destination);

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

    animate1();
    animate2();
    animate3();
}

//generate random color
function generateRandomColor(barHeight) {
    // Ensure barHeight is within a reasonable range
    barHeight = Math.max(0, Math.min(255, barHeight));

    // Option 1: Use barHeight to influence red, green, and blue values differently
    let r = (barHeight + Math.floor(Math.random() * 100)) % 256;
    let g = (barHeight * 2 + Math.floor(Math.random() * 100)) % 256;
    let b = (barHeight / 2 + Math.floor(Math.random() * 100)) % 256;

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
        // Optionally show an error message to the user
        alert('Error: ' + error.message);
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


        const img = document.getElementById('albumArt');
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
    jungle.setPitchTranspose(0, 0);
    pitchLabel.textContent = "0x";
});

//equlizer

const sliders = eqBands.map((freq, idx) => {  // Use 'idx' instead of 'index'
    const divslider = document.createElement('div');
    divslider.classList.add('divslider');
    const sliderlabel = document.createElement('label');
    sliderlabel.classList.add('sliderlabel');
    sliderlabel.textContent = freq + 'Hz';
    const slidervlabel = document.createElement('label');
    slidervlabel.classList.add('sliderlabelvalue');
    slidervlabel.textContent = '0';
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.orient = 'vertical';
    slider.style.direction = 'rtl';
    slider.style.writingMode = 'vertical-lr';
    slider.style.width = '10%';
    slider.style.height = '300px';
    slider.style.alignSelf = 'center';
    slider.min = -40;
    slider.max = 40;
    slider.value = 0;
    slider.step = 0.1;

    slider.addEventListener('input', (event) => {
        if (filters) {
            filters[idx].gain.value = parseFloat(event.target.value);// Use 'idx' correctly here            

        }
        slidervlabel.textContent = parseFloat(event.target.value);
    });
    slider.addEventListener('change', (event) => {
        if (filters) {
            filters[idx].gain.value = parseFloat(event.target.value);// Use 'idx' correctly here            
        }
        slidervlabel.textContent = parseFloat(event.target.value);
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
    sliders.forEach((slider) => {
        slider.value = 0;
    });
    if (filters) {
        filters.forEach((filter) => {
            filter.gain.value = 0;

        });
    }
    eqlablels.forEach((label) => {
        label.textContent = '0';

    });

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
        playersection.style.gridTemplateColumns = 'none';
        playersection.style.maxWidth = 'none';
        playersection.style.justifyContent = 'center';
        setWidthHeight();

    }
});

