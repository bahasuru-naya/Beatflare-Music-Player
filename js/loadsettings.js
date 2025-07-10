function loadsettings() {
    //volume
    const savedVolume = localStorage.getItem('playerVolume');
    if (savedVolume !== null) {
        const volume = parseFloat(savedVolume);
        volumeSlider.value = volume;
        audioPlayer.volume = volume;
        vpresent.textContent = Math.floor(volume * 100) + '%';

        if (Math.floor(volume * 100) === 0) {
            mute.checked = true;
            muteicon.innerHTML = mutesvg;
        } else {
            mute.checked = false;
            muteicon.innerHTML = unmutesvg;
        }
    }

    //playback speed
    const savedSpeed = localStorage.getItem('playbackSpeed');
    if (savedSpeed !== null) {
        const speedsave = parseFloat(savedSpeed);
        speed = speedsave;
        speedControl.value = speedsave;
        audioPlayer.playbackRate = speedsave;
        speedlablel.textContent = speedsave + 'x';
    }

    //pitch
    const savedPitch = localStorage.getItem('pitchValue');
    if (savedPitch !== null) {
        const pitch = parseFloat(savedPitch);
        pitchControl.value = pitch;
        pitchLabel.textContent = pitch + 'x';
        if (jungle) {
            jungle.setPitchTranspose(0, pitch);
        }
    }


    //equalizer
    const savedEQ = JSON.parse(localStorage.getItem('eqSettings'));
    if (savedEQ && Array.isArray(savedEQ)) {
        savedEQ.forEach((gainValue, idx) => {
            if (sliders[idx]) {
                sliders[idx].value = gainValue;
                sliders[idx].dispatchEvent(new Event('input')); // Apply value & UI update
            }
        });
    }

    //equalizer preset
    const savedPreset = localStorage.getItem('eqPreset');
    if (savedPreset) {
        equSelect.value = savedPreset;
    }

    //stereo
    const savedStereo = localStorage.getItem('stereoValue');
    if (savedStereo !== null) {
        const stereo = parseFloat(savedStereo);
        stereoControl.value = stereo;

        if (panNode) {
            panNode.pan.value = stereo;
        }

        // Update the labels with the new stereo values
        const stereoValue1 = 1 + (-stereo);
        const stereoValue2 = 1 + stereo;
        stereoLabel1.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + stereoValue1.toFixed(1);
        stereoLabel2.innerHTML = "<i class='fa-solid fa-volume-low'></i> " + stereoValue2.toFixed(1);
    }

    //lowpass
    const savedLowpassf = localStorage.getItem('lowpassControlF');
    if (savedLowpassf !== null) {
        const value = parseFloat(savedLowpassf);
        lowpassControlF.value = value;

        var minValue = 20;
        if (audioctx) {
            maxValue = audioctx.sampleRate / 2;
        } else {
            maxValue = 48000 / 2;
        }
        // Logarithm (base 2) to compute how many octaves fall in the range.
        var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
        // Compute a multiplier from 0 to 1 based on an exponential scale.
        var multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
        if (lowfilter) {
            lowfilter.frequency.value = maxValue * multiplier;
        }
        lowpassLabelF.textContent = (maxValue * multiplier).toFixed(2) + "Hz";
    }

    const savedLowpassQ = localStorage.getItem('lowpassControlQ');
    if (savedLowpassQ !== null) {
        const value = parseFloat(savedLowpassQ);
        lowpassControlQ.value = value;

        if (lowfilter) {
            lowfilter.Q.value = value * QUAL_MUL;
        }
        lowpassLabelQ.textContent = (value * QUAL_MUL).toFixed(2);
    }

    //highpass
    const savedHighpassf = localStorage.getItem('highpassControlF');
    if (savedHighpassf !== null) {
        const value = parseFloat(savedHighpassf);
        highpassControlF.value = value;

        var minValue = 20;
        if (audioctx) {
            maxValue = audioctx.sampleRate / 2;
        } else {
            maxValue = 48000 / 2;
        }
        // Logarithm (base 2) to compute how many octaves fall in the range.
        var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
        // Compute a multiplier from 0 to 1 based on an exponential scale.
        var multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
        if (highfilter) {
            highfilter.frequency.value = maxValue * multiplier;
        }
        highpassLabelF.textContent = (maxValue * multiplier).toFixed(2) + "Hz";
    }

    const savedHighpassQ = localStorage.getItem('highpassControlQ');
    if (savedHighpassQ !== null) {
        const value = parseFloat(savedHighpassQ);
        highpassControlQ.value = value;

        if (highfilter) {
            highfilter.Q.value = value * QUAL_MUL;
        }
        highpassLabelQ.textContent = (value * QUAL_MUL).toFixed(2);
    }

    //visualiztion toggle
    const savedVisual = localStorage.getItem('visualToggle');
    if (savedVisual !== null) {
        if (savedVisual === 'true') {
            visualonoff.checked = true;
        } else {
            visualonoff.checked = false;
        }
    }

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

    //dark mode
    const darkModeSaved = localStorage.getItem('darkModeEnabled');
    if (darkModeSaved === 'true') {
        darkModeToggle.checked = true;
    } else {
        darkModeToggle.checked = false;
    }

    if (darkModeToggle.checked === false) {

        //theme
        const savedThemeKey = localStorage.getItem('selectedTheme');
        if (savedThemeKey && themes[savedThemeKey]) {
            // Set the select element to saved value
            themeSelect.value = savedThemeKey;

            // Apply the theme
            const savedTheme = themes[savedThemeKey];
            Object.keys(savedTheme).forEach(key => {
                document.documentElement.style.setProperty(key, savedTheme[key]);
            });
        }

    } else {
        const savedThemeKey = localStorage.getItem('selectedTheme');
        if (savedThemeKey && themes[savedThemeKey]) {
            // Set the select element to saved value
            themeSelect.value = savedThemeKey;
        }
    }

    setdarkmode();



}