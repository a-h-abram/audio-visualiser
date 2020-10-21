class AudioVisualiser {
    constructor(threeScene) {
        this.threeScene = threeScene;
        this.audioFile = null;
        this.audioPlayer = null;
        this.audioCtx = null; // audio context
        this.offlineAudio = null;
        this.parsingAudio = false;
        this.fftSize = 4096; // fast fourier transform lower to be easier to compute windows*/
        this.beatThreshold = 200; // used to detect beats
        this.maxFrequencyDetected = 100; // per default
        this.peakOccurence = 0;
        this.gainAdapted = false;
        this.gainWaiting = false;

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

        // Web Audio API components initialisation
        this.audioCtx = new AudioContext();
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
        // filter.frequency.value = 800;
        // filter.gain.value = 1500;

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

        this.audioLoaded = true;
        this.loading = 100;
    };

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
    render = async () => {
        this.analyser.getByteFrequencyData(this.audioData);
        this.filterAnalyser.getByteFrequencyData(this.filteredData);

        let isDrum = false;
        let count = 0;

        for (let i = 0; i < 100; i++) {
            count = 0;

            if (this.filteredData[i] > 250) {
                for (let k = i; k < i + 20; k++) {
                    if (this.filteredData[k] > 230) {
                        count++;
                    } else {
                        break;
                    }
                }

                if (count > 4 && count < 9) {
                    this.peakOccurence++;
                    isDrum = true;
                }

                break;
            } else if (this.filteredData[i] < 200) {
                this.peakOccurence = 0;
            }
        }

        if (isDrum) {
            // if peakOccurence is higher than 20, the bass are probably too loud so we decrease the gain to isolate drums
            /*if (this.peakOccurence > 20 && this.gain.gain.value > 8) {
                this.gain.gain.value--;
            } else if (this.peakOccurence === 0 && this.gain.gain.value < 12) {
                this.gain.gain.value++;
            }*/

            this.threeScene.rgbShiftCtrl.angle = 2.5;
            this.threeScene.rgbShiftCtrl.rgbAmount = 0.005;
            this.threeScene.meshes[0].rotation.x += 0.06 * (count / 30);
            this.threeScene.meshes[0].rotation.y += 0.07 * (count / 30);
        }

        const overallAvg = this.arrayAverage(this.audioData);

        this.threeScene.updatePlane(this.threeScene.meshes[1], this.modulate(overallAvg, 0, .1, .1, .105));
    };

    arrayAverage = (arr) => {
        const total = arr.reduce(function(sum, b) { return sum + b; });

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
        }
    };

    play = () => {
        if (this.audioPlayer && this.filteredPlayer) {
            this.filteredPlayer.play();
            this.audioPlayer.play();
        }
    };

    updateTime = () => {
        if (this.audioPlayer && this.filteredPlayer) {
            this.filteredPlayer.currentTime = this.audioPlayer.currentTime;
        }
    };

}