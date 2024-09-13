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
const canvas = document.getElementById('canvas');
const visual = document.getElementById('visual');
const player = document.getElementById('player');

let files = [];
let currentIndex = -1;
let listItemMap = new Map();
let isAudioConnected = false;

const ctx = canvas.getContext('2d');
let audio;
let audiosrc;
let analyser;
let animation;
let audioctx;

document.addEventListener('DOMContentLoaded', function() {   

    // Set the canvas height initially
    setCanvasHeight();

    // Optionally, update the canvas height on window resize
    window.addEventListener('resize', setCanvasHeight);
});


function setCanvasHeight() {
    if (player && visual) {
        visual.style.height = player.offsetHeight-20 + 'px';
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
    let barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x;
    function animate() {
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i]/2;            
            ctx.fillStyle = generateRandomColor(dataArray[i]);
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
        animation = requestAnimationFrame(animate);
    }
    animate();
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




fileInput.addEventListener('change', function(event) {
    const newFiles = Array.from(event.target.files);
    files = [...files, ...newFiles];
    updatePlaylist();
    setCanvasHeight();
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
    files.forEach((file, index) => {
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

playPauseButton.addEventListener('click', function() {
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

prevButton.addEventListener('click', function() {
    if (currentIndex > 0) {
        playFile(currentIndex - 1);
    }
});

nextButton.addEventListener('click', function() {
    if (currentIndex < files.length - 1) {
        playFile(currentIndex + 1);
    }
});

audioPlayer.addEventListener('timeupdate', function() {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    seekBar.value = progress;
   
    currentTimeLabel.textContent = formatTime(audioPlayer.currentTime);
    if (audioPlayer.duration){
    durationLabel.textContent = formatTime(audioPlayer.duration);
    }else{
        durationLabel.textContent = '0:00';
    }
    
});

seekBar.addEventListener('input', function() {
    const time = (seekBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = time;
});

volumeSlider.addEventListener('input', function() {
    audioPlayer.volume = volumeSlider.value;
});

audioPlayer.addEventListener('ended', function() {
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






