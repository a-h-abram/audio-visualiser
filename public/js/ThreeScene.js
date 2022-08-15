class ThreeScene {
    SCENE_POS = {
        GROUND: 0,
        SKY: 1
    };
    constructor() {
        this.clock = new THREE.Clock();
        this._cameraTimer = null;
        this._cameraEventDuration = null;
        this.audioLoaded = false;
        this.loading = false;
        this.loadingBar = document.getElementById("loading-bar");
        this.meshes = [];
        this.noise = new SimplexNoise();
        this.audioVisualiser = new AudioVisualiser(this);
        this.flashShader = null;
        this.fxaaShader = null;
        this.rgbShiftCtrl = {
            shader: null,
            angle: 0, // 3.5
            rgbAmount: 0 // 0.003
        };
        this.groundPlanes = [];
        this.animationSpeed = 2;
        this.scene = new THREE.Scene();

        this.setupRenderer();
        this.setupCamera();

        this.rythmLights = new RythmLights(this.scene, this._camera.getMainCamera());

        this.setupLights();
        this.setupMainScene();
        this.setupEffectComposer();
        this.setupShaders();
	    this.setupListeners();
    }

    run = () => {
        this.animate();
    };

    setupListeners = () => {
        window.addEventListener('resize', _ => {
            this._camera.getMainCamera().aspect = window.innerWidth / window.innerHeight;
            this._camera.getMainCamera().updateProjectionMatrix();

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.composer.setSize(window.innerWidth, window.innerHeight);
            this.composer.setPixelRatio(window.devicePixelRatio);

            const pixelRatio = this.renderer.getPixelRatio();

            if (this.fxaaShader) {
                this.fxaaShader.material.uniforms.resolution.value.x = 1 / (window.innerWidth * pixelRatio);
                this.fxaaShader.material.uniforms.resolution.value.y = 1 / (window.innerHeight * pixelRatio);
            }
        }, false );
    };

    setupRenderer = () => {
        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        document.getElementById('main-canvas').appendChild(this.renderer.domElement);
    };

    setupCamera = () => {
        this._camera = new Camera();
        this._camera.scenePos = this.SCENE_POS.GROUND;
    };

    setupLights = () => {
        const ambientLight = new THREE.AmbientLight(0x404040);
        let directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        let pointLight = new THREE.PointLight(0xffffff, 1000, 100);

        directionalLight.position.set(0, 100, 0);
        directionalLight.lookAt(0, 0, 0);
        pointLight.position.set(0, 10, 10);

        this.scene.add(ambientLight, directionalLight, pointLight);
    };

    setupEffectComposer = () => {
        this.composer = new THREE.EffectComposer(this.renderer);

        this.composer.setPixelRatio(window.devicePixelRatio);
        this.composer.addPass(new THREE.RenderPass(this.scene, this._camera.camera));
    };

    setupGlitchEffect = () => {
        const glitchPass = new THREE.GlitchPass();

        glitchPass.renderToScreen = true;

        this.composer.addPass(glitchPass);
    };

    setupShaders = () => {
        // console.log(THREE.RGBShiftShader);
        const rgbShift = new THREE.ShaderPass(THREE.RGBShiftShader);

        this.rgbShiftCtrl.shader = rgbShift;
        this.rgbShiftCtrl.shader.uniforms.amount.value = this.rgbShiftCtrl.rgbAmount;
        this.rgbShiftCtrl.shader.uniforms.angle.value = this.rgbShiftCtrl.angle;

        this.flashShader = new THREE.ShaderPass(THREE.FlashShader);

        this.fxaaShader = new THREE.ShaderPass(THREE.FXAAShader);

        const pixelRatio = this.renderer.getPixelRatio();

        this.fxaaShader.material.uniforms.resolution.value.x = 1 / ( window.innerWidth * pixelRatio);
        this.fxaaShader.material.uniforms.resolution.value.y = 1 / ( window.innerHeight * pixelRatio);

        this.composer.addPass(rgbShift);
        this.composer.addPass(this.flashShader);
        this.composer.addPass(this.fxaaShader);
    };

    setupMainScene = () => {
        this.scene.fog = new THREE.FogExp2(0x11111f, 0.002);

        this.rainClouds = new Clouds(this.scene);
        this.clouds = new Clouds(this.scene, 200, 'imgs/white_smoke.png', 350);
        this.rain = new Rain(this.scene, 3000, true);

        if (randomBetween(0, 3) === 0) {
            console.log("RAIN ENABLED");
            this.rain.enable();
        }

        const planeGeometry = new THREE.PlaneGeometry(2000, 2000, 30, 30);
        const planeMaterial = new THREE.MeshLambertMaterial({
            color: 0x6904ce,
            side: THREE.DoubleSide,
            wireframe: true
        });

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        const plane2 = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.rotation.x = -0.5 * Math.PI;
        plane.position.set(0, -30, 0);
        plane2.rotation.x = -0.5 * Math.PI;
        plane2.position.set(0, -30, -2000);

        this.groundPlanes.push(plane, plane2);
        this.scene.add(plane, plane2);
        this.meshes.push(plane);

        // Setup Sky
        this.sky = new Sky();
        this.sky.scale.setScalar(450000);
        this.scene.add(this.sky);

        this.sun = new THREE.Vector3();

        this.timeEffectCtrl = {
            turbidity: 10,
            rayleigh: 3,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.7,
            inclination: 0.49, // elevation / inclination
            azimuth: 0.25, //0.25, // Facing front,
            exposure: 0.06, // this.renderer.toneMappingExposure
            flashing: false // Exposure flashes
        };

        // console.log(this.timeEffectCtrl);
    };

    updateRgbShift = () => {
        this.rgbShiftCtrl.shader.uniforms.amount.value = this.rgbShiftCtrl.rgbAmount;
        this.rgbShiftCtrl.shader.uniforms.angle.value = this.rgbShiftCtrl.angle;

        if (this.rgbShiftCtrl.rgbAmount > 0) {
            this.rgbShiftCtrl.rgbAmount -= 0.001;
            this.rgbShiftCtrl.rgbAmount.clamp(0, 1);
        } if (this.rgbShiftCtrl.angle > 0) {
            this.rgbShiftCtrl.angle -= 0.3;
            this.rgbShiftCtrl.angle.clamp(0, 2);
        }
    };

    // moving those planes give the impression to move forward
    movePlanes = () => {
        this.groundPlanes.forEach((plane) => {
            plane.position.z += this.animationSpeed;

            if (plane.position.z >= 2000) {
                plane.position.z = -2000;
            }
        });
    };

    updateAnimationSpeed = () => {
        if (this.animationSpeed > 2) {
            this.animationSpeed -= 0.13;
        }

        this.animationSpeed.clamp(2, Math.Infinity);
    };

    updateSky = () => {
        // if (this._camera.isMoving && this._camera.nextScenePos === this.SCENE_POS.SKY) {
        //     gsap.to(this.timeEffectCtrl, {
        //         duration: this._camera.duration,
        //         azimuth: 0.25,
        //         rayleigh: 1.46,
        //         turbidity: 14,
        //         exposure: 0.5
        //     });
        // } else if (this._camera.isMoving && this._camera.nextScenePos === this.SCENE_POS.GROUND) {
        //     gsap.to(this.timeEffectCtrl, {
        //         duration: this._camera.duration,
        //         azimuth: 0.25,
        //         rayleigh: 3,
        //         turbidity: 10,
        //         exposure: 0.06
        //     });
        // }

        // Apply the current time effect

        const uniforms = this.sky.material.uniforms;

        uniforms.turbidity.value = this.timeEffectCtrl.turbidity;
        uniforms.rayleigh.value = this.timeEffectCtrl.rayleigh;
        uniforms.mieCoefficient.value = this.timeEffectCtrl.mieCoefficient;
        uniforms.mieDirectionalG.value = this.timeEffectCtrl.mieDirectionalG;

        const theta = Math.PI * (this.timeEffectCtrl.inclination - 0.5);
        const phi = 2 * Math.PI * (this.timeEffectCtrl.azimuth - 0.5);

        this.sun.x = Math.cos(phi);
        this.sun.y = Math.sin(phi) * Math.sin(theta);
        this.sun.z = Math.sin(phi) * Math.cos(theta);

        uniforms.sunPosition.value.copy(this.sun);

        this.renderer.toneMappingExposure = this.timeEffectCtrl.exposure;
    };

    animate = () => {
        requestAnimationFrame(this.animate);

        if (!this.audioVisualiser.audioLoaded || !this.audioVisualiser.isPlaying) {
            if (randomBetween(1, 100) === 1) {
                this.rgbShiftCtrl.angle = 2.5 * randomBetween(1, 2);
                this.rgbShiftCtrl.rgbAmount = 0.005 * randomBetween(1, 3);
            }
        } else {
            this.audioVisualiser.render();
        }

        // Reset elements
        this.flashShader.uniforms.white.value = 0;

        if (this.timeEffectCtrl.flashing) {
            this.timeEffectCtrl.exposure = 0.06;
            this.timeEffectCtrl.mieDirectionalG = 0.7;
            this.timeEffectCtrl.flashing = false;
        }

        // We've detected a drum
        if (this.audioVisualiser.isDrum) {
            this.animationSpeed = 3;
            // console.log("Visualizer peak occurence: " + this.audioVisualiser.peakOccurence);

            // RGB Shift Effect
            if (this.audioVisualiser.peakOccurence > 5) {
                this.rgbShiftCtrl.angle = 2.5 * (this.audioVisualiser.peakOccurence / 20) * ((randomBetween(1, 2) === 1) ? 1 : -1);
                this.rgbShiftCtrl.rgbAmount = 0.005 * (this.audioVisualiser.peakOccurence / 20);
            }

            if (randomBetween(1, 30) < 10) {
                this.rainClouds.willFlash = true;
            }

            switch (this.audioVisualiser.peakOccurence) {
                case 0:
                    this.timeEffectCtrl.exposure = 0.06;
                    this.timeEffectCtrl.mieDirectionalG = 0.7;
                    this.timeEffectCtrl.flashing = false;
                case 3:
                    // Flash
                    this.flashShader.uniforms.white.value = .025;
                    this.timeEffectCtrl.exposure = 0.1;
                    break;
                case 4:
                    // Skybox flash
                    if (!this.timeEffectCtrl.flashing) {
                        this.timeEffectCtrl.exposure = 0.2;
                        this.timeEffectCtrl.mieDirectionalG = 0.95;
                        this.timeEffectCtrl.flashing = true;
                    }
                    break;
                case 5:
                    // Some lights patterns
                    this.rythmLights.sendLights(this.audioVisualiser.peakAverage > 200);
                    break;
                default:
                    this.timeEffectCtrl.exposure = 0.06;
                    this.timeEffectCtrl.mieDirectionalG = 0.7;
                    this.timeEffectCtrl.flashing = false;
                    break;
            }
        }

        // const now = new Date().getTime();

        // if (this._cameraTimer) {
        //     console.log('diff: ' + (now - this._cameraTimer));
        //     console.log('cameventdur=' + this._cameraEventDuration);
        // }

        // if (this.audioVisualiser.highFreqAvgCount > 150 && this._camera.scenePos !== this.SCENE_POS.SKY
        //     && !this._camera.isMoving) {
        //     this._cameraTimer = new Date().getTime();
        //     this._cameraEventDuration = randomBetween(5, 10) * 1000; // wait between 5 and 10 seconds (in ms)
        //     this._camera.moveTop(1, this.SCENE_POS.SKY);
        // } else if (this.audioVisualiser.lowFreqAvgCount > 200 && this._camera.scenePos !== this.SCENE_POS.GROUND
        //     && !this._camera.isMoving && this._cameraTimer && (now - this._cameraTimer) > this._cameraEventDuration) {
        //     this._cameraTimer = null; // reset timer
        //     this._camera.moveBot(0.5, this.SCENE_POS.GROUND);
        // }

        // update objects in the scene
        this.clouds.update();
        this.rainClouds.update();
        this.rain.update();
        this.rythmLights.update();
        this.movePlanes();
        this.updateSky();
        this._camera.update();

        // update post-process effects
        this.updateRgbShift();

        this.composer.render();

        this.updateAnimationSpeed();
    };

    reset = () => {
        // TODO: stop all particles system
        // TODO: prepare AudioVisualiser to reinitialise again
    };

    loadAudio = async (audio, audioPlayer) => {
        // this.showLoadingAudioScreen();

        await this.audioVisualiser.loadAudio(audio, audioPlayer);
    };

    showLoadingAudioScreen = () => {
        this.loading = true;
    };

    hideLoadingAudioScreen = () => {
        this.loading = false;
    };

    

    updatePlane = (mesh, distortionFr) => {
        const self = this;
        // const camPos = this._camera.getPosition();

        mesh.geometry.vertices.forEach((vertex, i) => {
            const time = Date.now();
            const roadLength = 150;
            const planeWidth = 50;
            const midWith = planeWidth / 2;
            let amp = 3;
            let distance = 1;
            let distanceRatio = 1;
            
            // Check the vertex X and Y
            // If the x and Y are near the camera, amp = 2
            // Else => amp = 10

            if ((vertex.x > midWith + roadLength || vertex.x < midWith - roadLength) && (vertex.y > midWith + roadLength || vertex.y < midWith - roadLength)) {
                const x = vertex.x - ((vertex.x > midWith + roadLength) ? (midWith + roadLength) : (midWith - roadLength));
                const y = vertex.y - ((vertex.y > midWith + roadLength) ? (midWith + roadLength) : (midWith - roadLength));
                
                // distance = Math.sqrt((x * x) + (y * y));
                // distanceRatio = 1 / distance * 100;
                amp = 10;
            }
            
            vertex.z = (self.noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * (amp * distanceRatio);
        });

        mesh.geometry.verticesNeedUpdate = true;
        // mesh.geometry.normalsNeedUpdate = true;
        
        mesh.geometry.computeVertexNormals();
        // mesh.geometry.computeFaceNormals();
    };

    loadBuildings = () => {
        const loader = new THREE.OBJLoader();

        loader.load(window.location.href + '/models/', this.onBuildingLoaded);
    };

    onBuildingLoaded = (model) => {
        // our buildings.obj file contains many models
        // so we have to traverse them to do some initial setup

        this.buildingModels = [...model.children].map((model) => {
            // scale model down
            const scale = .01;

            model.scale.set(scale, scale, scale);

            model.position.set(0, -14, 0);
            model.receiveShadow = true;
            model.castShadow = true;

            return model;
        });
    };
}
