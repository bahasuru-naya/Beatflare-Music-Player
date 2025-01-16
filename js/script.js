const fileInput = document.getElementById('file-input');
const audioPlayer = document.getElementById('audio-player');
const playPauseButton = document.getElementById('play-pause');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const seekBar = document.getElementById('seek-bar');
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

let files = [];
let currentIndex = -1;
let listItemMap = new Map();
let isAudioConnected = false;

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
    setCanvasHeight();

    // Optionally, update the canvas height on window resize
    window.addEventListener('resize', setCanvasHeight);
});


function setCanvasHeight() {
    if (player && visual1) {
        visual1.style.height = player.offsetHeight - 20 + 'px';
    }
    if (player && visual2) {
        visual2.style.height = player.offsetHeight - 20 + 'px';
    }
    if (player && visual3) {
        visual3.style.height = player.offsetHeight - 20 + 'px';
    }
}



//visualizer

function audiovisual(player) {
    audio = player;
    audioctx = new AudioContext();
    setCanvasHeight();

    if (!isAudioConnected) {

        audiosrc = audioctx.createMediaElementSource(audio);
        analyser = audioctx.createAnalyser();
        audiosrc.connect(analyser);
        analyser.connect(audioctx.destination);
        analyser.fftSize = 256;
        isAudioConnected = true;
    }
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let barWidth = (canvas1.width / bufferLength) * 2.5;
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
    const numBubbles = 50; // Fixed number of bubbles

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




fileInput.addEventListener('change', function (event) {
    const newFiles = Array.from(event.target.files);
    files = [...files, ...newFiles];
    updatePlaylist();
    setCanvasHeight();
    updateButtonsState(currentIndex)
    audiovisual(audioPlayer);
    if (currentIndex === -1 && files.length > 0) {
        playFile(0);
    }

});

function updatePlaylist() {
    playlist.innerHTML = '';
    listItemMap.clear();
    files.forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        listItem.setAttribute('data-index', index);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
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
}

function handleRemoveFile(index) {
    const listItem = listItemMap.get(index);
    listItem.style.display = 'none';

    if (index === currentIndex) {
        audioPlayer.pause();

        if (files.length === 1) {
            // If only one file, remove it completely
            files = [];
            listItemMap.clear();
            playlist.innerHTML = '';
            currentIndex = -1;
            playPauseButton.textContent = 'Play';
            audioPlayer.src = '';

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
        playPauseButton.textContent = 'Pause';
        updatePlaylistHighlight(index);
        updateButtonsState(index);
        currentIndex = index;
        audioctx.resume();
        audiovisual(audioPlayer);

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

playPauseButton.addEventListener('click', function () {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseButton.textContent = 'Pause';
        audioctx.resume();
        audiovisual(audioPlayer);
    } else {
        audioPlayer.pause();
        playPauseButton.textContent = 'Play';
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
    }

});

seekBar.addEventListener('input', function () {
    const time = (seekBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = time;
});

volumeSlider.addEventListener('input', function () {
    audioPlayer.volume = volumeSlider.value;
});

audioPlayer.addEventListener('ended', function () {
    if (currentIndex < files.length - 1) {
        playFile(currentIndex + 1);
    } else {
        playPauseButton.textContent = 'Play';
    }
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}






