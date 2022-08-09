class AudioVisualiser {
    constructor(threeScene) {
        this.threeScene = threeScene;
        this.audioFile = null;
        this.audioPlayer = null;
        this.audioCtx = null; // audio context
        this.offlineAudio = null;
        this.fftSize = 2048;//4096; // fast fourier transform lower to be easier to compute windows
        this.peakOccurence = 0;
        this.isDrum = false;
        this.isPlaying = false;
        this.timeStart = 0;
        this.freqCount = 0;
        this.highFreqAvgCount = 0;
        this.lowFreqAvgCount = 0;

        this.drumThreshold = 250; // per default BUT the value adapt itself if it does not detect a drum during 2 seconds
        this.drumLastDetection = Date.now();
        this.highestFrequencyBelowDrumThreshold = 0;
        this.defaultPeakDetection = 230; // Frequency where we start to analyse a peak
        this.peakAverage = 0;

        this.loading = 0;
        this.audioLoaded = false;

        // const AudioContext = window.AudioContext || window.webkitAudioContext;

        /*const listener = new THREE.AudioListener();

        camera.add(listener);

        this.globalAudio = new THREE.Audio(listener);*/
    }

    loadAudio = async (audioFile, audioPlayer) => {
        // private members initialisation
        this.loading = 0;
        this.audioFile = audioFile;
        this.audioPlayer = audioPlayer;
        this.filteredPlayer = audioPlayer.cloneNode();
        this.averageFrequencies = 0;

        // Web Audio API components initialisation
        this.audioCtx = new window.AudioContext || window.webkitAudioContext;
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = this.fftSize;

        this.filterAnalyser = this.audioCtx.createAnalyser();
        this.filterAnalyser.fftSize = this.fftSize;

        const src = this.audioCtx.createMediaElementSource(this.audioPlayer);
        // cloning the current audio to apply some filters on it & detect easier the drums, hats, etc
        const filteredSrc = this.audioCtx.createMediaElementSource(this.filteredPlayer);

        // apply filter to detect easier the beats of the song
        this.gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();
        const filterLowPass = this.audioCtx.createBiquadFilter();

        filter.type = "lowshelf";

        filterLowPass.type = "lowpass";
        filterLowPass.frequency.value = 20;
        filterLowPass.gain.value = 1500;

        this.gain.gain.value = 10;

        // piping filters & analyser to the cloned audio
        filteredSrc.connect(filterLowPass);
        filterLowPass.connect(filter);
        filter.connect(this.gain);
        this.gain.connect(this.filterAnalyser);
        // this.filterAnalyser.connect(this.audioCtx.destination); // uncomment this part if you want to listen the filtered audio

        // piping original audio with the audio output
        src.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);

        this.audioData = new Uint8Array(this.analyser.frequencyBinCount);
        this.filteredData = new Uint8Array(this.filterAnalyser.frequencyBinCount);

        // final steps (play audios & set loading values)
        this.play();
        this.threeScene.clock.start();

        this.audioLoaded = true;
        this.loading = 100;
    };

    /**
     * We generate a pattern of different events randomly and based on the music rythm
     */
    generateAnimationPattern = async() => {

    }

    /**
     * This method:
     * - parse the whole music file
     * - apply a low-pass filter (LPF) to isolate the kick drums
     * - calculating peaks & determine a threshold for beat detection
     */
    prepareOfflineContext = async () => {
        const arrayBuffer = await this.request(this.audioFile);

        console.log(arrayBuffer);

        return await this.audioCtx.decodeAudioData(arrayBuffer, (buffer) => {
            return new Promise(async (resolve, reject) => {
                this.offlineCtx = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
                this.filterAnalyser = this.offlineCtx.createAnalyser();
                this.filterAnalyser.fftSize = this.fftSize;

                const offlineSrc = this.offlineCtx.createBufferSource();

                offlineSrc.buffer = buffer;

                const filter = this.offlineCtx.createBiquadFilter();

                filter.type = "lowpass";
                offlineSrc.connect(filter);
                filter.connect(this.offlineCtx.destination);
                offlineSrc.start(0);

                const filteredBuff = await this.offlineCtx.startRendering();
                // const data = filteredBuff.getChannelData(0);
                this.offlineAudio = this.offlineCtx.createBufferSource();

                this.offlineAudio.buffer = filteredBuff;

                // piping
                this.offlineAudio.connect(this.filterAnalyser);
                this.filterAnalyser.connect(this.offlineCtx.destination);

                this.offlineAudio.start(0);

                // console.log(data);
                // await offlineSrc.startRendering();
                console.log('prepareOfflineContext will out');
                resolve(true);
            });
        });
    };

    request = obj => {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.open("GET", obj, true);

            xhr.responseType = 'arraybuffer';

            if (obj.headers) {
                Object.keys(obj.headers).forEach(key => {
                    xhr.setRequestHeader(key, obj.headers[key]);
                });
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.statusText);
                }
            };

            xhr.onerror = () => reject(xhr.statusText);
            xhr.send(obj.body);
        });
    };

    // should be called in the ThreeJs render method
    render = () => {
        this.analyser.getByteFrequencyData(this.audioData);
        this.filterAnalyser.getByteFrequencyData(this.filteredData);

        this.isDrum = false;
        let count = 0;
        let peakAvg = 0; // Give the peak frequency average
        let peakCount = 0; // Used to calculte the peak average (ponderated average)

        // Check if we did not detect a drum since a long time
        const now = Date.now();

        if (now - this.drumLastDetection >= 2000) {
            this.drumThreshold = this.peakAverage;
        } else if (this.peakOccurence > 9) { // Boost the threshold
            this.drumThreshold += 20;
            
            // Clamp the value
            if (this.drumThreshold > 250) {
                this.drumThreshold = 250;
            }
        }

        let highestFreqIndex = 0;
        let highestFreq = 0;
        let freqAvg = 0;
        const freqCount = 20;

        // 1. Analyse the peak pattern
        for (let i = 0; i < freqCount; i++) {
            const freq = this.filteredData[i];

            freqAvg += freq;

            if (freq > highestFreq) {
                highestFreq = freq;
                highestFreqIndex = i;
            }
        }

        // 2. Once we've detected the highest frequency, we analyse the pattern of the peak
        // const overallFreqAvg = freqAvg / freqCount;
        // const diffPeakAndAvg = (highestFreq - overallFreqAvg) / 2;

        // if (diffPeakAndAvg < 0) {
        //     let freqPeakCount = 0;

        //     for (let i = highestFreqIndex; i < freqCount; i++) {
        //         const freq = this.filteredData[i];

        //         if (freq > overallFreqAvg && freq >= (highestFreq - diffPeakAndAvg)) {
        //             freqPeakCount++;
        //         }
        //     }

        //     // Now we've got a drum threshold
        // }


        // 2. Apply the drum detection
        for (let i = 0; i < 25; i++) {
            const freq = this.filteredData[i];
            count = 0;

            // Register the highest frequency detected
            if (freq < this.drumThreshold && freq > this.highestFrequencyBelowDrumThreshold) {
                this.highestFrequencyBelowDrumThreshold = freq;
            }

            // Detect the start of a peak
            if (this.filteredData[i] > this.drumThreshold) {
                // Parse the 20 next freq peak
                for (let k = i; k < i + 20; k++) {
                    peakAvg += this.filteredData[k];
                    peakCount++;
                    
                    if (this.filteredData[k] > this.defaultPeakDetection) {
                        count++;
                    } else {
                        break;
                    }
                }

                if (count > 4 && count < 9) {
                    // Avoid divisions by zero
                    if (peakCount > 0) {
                        this.peakAverage = peakAvg / peakCount;
                        console.log("peakAvg: " + peakAvg / peakCount);
                    }
                    
                    this.peakOccurence++;
                    this.isDrum = true;
                    console.log('drum detected');
                    this.drumLastDetection = Date.now();
                } else {
                    this.peakOccurence = 0;
                }

                break;
            } else {
                peakAvg = 0;
                peakCount = 0;
                // this.peakAverage = 0;
                this.peakOccurence = 0;
            }
        }

        const overallAvg = this.arrayAverage(this.audioData);


        if (overallAvg > 80) {
            this.highFreqAvgCount++;
            this.lowFreqAvgCount = 0;

            // console.log('highFreq', this.highFreqAvgCount);
        } else {
            this.lowFreqAvgCount++;
            this.highFreqAvgCount = 0;
        }

        this.threeScene.updatePlane(this.threeScene.groundPlanes[0], this.modulate(overallAvg, 0, .1, .1, .105));
    };

    arrayAverage = (arr) => {
        const total = arr.reduce((sum, b) => { return sum + b; });

        return (total / arr.length);
    };

    fractionate = (val, minVal, maxVal) => {
        return ((val - minVal) / (maxVal - minVal));
    };

    modulate = (val, minVal, maxVal, outMin, outMax) => {
        const fr = this.fractionate(val, minVal, maxVal);
        const delta = outMax - outMin;

        return outMin + (fr * delta);
    };

    pause = () => {
        if (this.audioPlayer && this.filteredPlayer) {
            this.filteredPlayer.pause();
            this.audioPlayer.pause();
            this.isPlaying = false;
        }
    };

    play = () => {
        if (this.audioPlayer && this.filteredPlayer) {
            this.filteredPlayer.play();
            this.audioPlayer.play();
            this.isPlaying = true;
        }
    };

    updateTime = () => {
        if (this.audioPlayer && this.filteredPlayer) {
            this.filteredPlayer.currentTime = this.audioPlayer.currentTime;
        }
    };

}
