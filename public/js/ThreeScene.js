class ThreeScene {
    constructor() {
        this.clock = new THREE.Clock();
        this.audioLoaded = false;
        this.loading = false;
        this.loadingBar = document.getElementById("loading-bar");
        this.meshes = [];
        this.noise = new SimplexNoise();
        this.audioVisualiser = new AudioVisualiser(this);
        this.rgbShiftCtrl = {
            shader: null,
            angle: 0, // 3.5
            rgbAmount: 0 // 0.003
        };
        this.groundPlanes = [];
        this.animationSpeed = 2;
        this.scene = new THREE.Scene();

        this.clouds = new Clouds(this.scene);
        this.rain = new Rain(this.scene);

        if (Math.floor(Math.random() * 3) === 0) {
            this.rain.enable();
        }

        this.setupRenderer();
        this.setupCamera();

        this.rythmLights = new RythmLights(this.scene, this.camera);

        this.setupLights();
        this.setupMainScene();
        this.setupEffectComposer();
        // this.setupGlitchEffect();
        this.setupRGBShift();
    }

    run = () => {
        this.animate();
    };

    setupRenderer = () => {
        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('main-canvas').appendChild(this.renderer.domElement);
    };

    setupCamera = () => {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.camera.position.set(0, 0, 80);
        // this.camera.lookAt(this.rain.rain.position);
    };

    setupLights = () => {
        const ambientLight = new THREE.AmbientLight(0x404040);

        this.scene.add(ambientLight);

        let directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);

        directionalLight.position.set(0, 100, 0);
        directionalLight.lookAt(0, 0, 0);

        this.scene.add(directionalLight);

        let pointLight = new THREE.PointLight(0xffffff, 1000, 100);
        let pointLightRight = new THREE.PointLight(0x404040, 1000, 100);
        let pointLightLeft = new THREE.PointLight(0x404040, 1000, 100);

        pointLight.position.set(0, 10, 10);
        pointLightRight.position.set(50, 10, 0);
        pointLightLeft.position.set(-50, 10, 0);
        // pointLight.power = 1000;

        this.scene.add(pointLight, pointLightRight, pointLightLeft);
    };

    setupEffectComposer = () => {
        this.composer = new THREE.EffectComposer(this.renderer);

        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
    };

    setupGlitchEffect = () => {
        const glitchPass = new THREE.GlitchPass();

        glitchPass.renderToScreen = true;
        this.composer.addPass(glitchPass);

        console.log(glitchPass);
    };

    setupRGBShift = () => {
        // console.log(THREE.RGBShiftShader);
        const rgbShift = new THREE.ShaderPass(THREE.RGBShiftShader);

        this.rgbShiftCtrl.shader = rgbShift;
        this.rgbShiftCtrl.shader.uniforms.amount.value = this.rgbShiftCtrl.rgbAmount;
        this.rgbShiftCtrl.shader.uniforms.angle.value = this.rgbShiftCtrl.angle;

        this.composer.addPass(rgbShift);
    };

    setupMainScene = () => {
        /*let geometry = new THREE.CubeGeometry(15, 15, 15);
        let material = new THREE.MeshPhongMaterial({ color: 0xff0000, wireframe: true });
        let cubeMesh = new THREE.Mesh(geometry, material);

        this.scene.add(cubeMesh);
        this.meshes.push(cubeMesh);*/

        this.scene.fog = new THREE.FogExp2(0x11111f, 0.002);

        const planeGeometry = new THREE.PlaneGeometry(1000, 2000, 40, 40);
        const planeMaterial = new THREE.MeshLambertMaterial({
            color: 0x6904ce,
            side: THREE.DoubleSide,
            wireframe: true
        });

        let plane = new THREE.Mesh(planeGeometry, planeMaterial);
        let plane2 = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.rotation.x = -0.5 * Math.PI;
        plane.position.set(0, -30, 0);
        plane2.rotation.x = -0.5 * Math.PI;
        plane2.position.set(0, -30, -2000);

        this.groundPlanes.push(plane, plane2);
        this.scene.add(plane, plane2);
        this.meshes.push(plane);

        // test clouds
        /*this.camera.position.z = 1;
        this.camera.rotation.x = 1.16;
        this.camera.rotation.y = -0.12;
        this.camera.rotation.z = 0.27;*/
    };

    updateRgbShift = () => {
        this.rgbShiftCtrl.shader.uniforms.amount.value = this.rgbShiftCtrl.rgbAmount;
        this.rgbShiftCtrl.shader.uniforms.angle.value = this.rgbShiftCtrl.angle;

        if (this.rgbShiftCtrl.rgbAmount > 0) {
            this.rgbShiftCtrl.rgbAmount -= 0.001;
        } if (this.rgbShiftCtrl.angle > 0) {
            this.rgbShiftCtrl.angle -= 0.3;
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
        } else if (this.animationSpeed < 2) {
            this.animationSpeed += 0.13;
        }
    };

    animate = () => {
        requestAnimationFrame(this.animate);

        if (!this.audioVisualiser.audioLoaded) {
            // TODO: Initiliazing the song
            const loadPercentage = this.audioVisualiser.loading;

            // this.loadingBar.style.width = loadPercentage + "%";

            if (loadPercentage === 100) {
                this.loading = false;
                this.audioLoaded = true;
            }
            // TODO: play song "Audio has been initilized ..."
        } else {
            this.audioVisualiser.render();
        }

        if (this.audioVisualiser.isDrum) {
            this.animationSpeed = 3;
            this.rgbShiftCtrl.angle = 2.5 * (this.audioVisualiser.peakOccurence / 20);
            this.rgbShiftCtrl.rgbAmount = 0.005 * (this.audioVisualiser.peakOccurence / 10);
            this.clouds.willFlash = true;

            if (this.audioVisualiser.peakOccurence === 5) {
                this.rythmLights.sendLights(false);
            }
        }

        // update objects in the scene
        this.clouds.update();
        this.rain.update();
        this.movePlanes();
        this.rythmLights.update();

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

    };

    updatePlane = (mesh, distortionFr) => {
        const self = this;
        mesh.geometry.vertices.forEach(function (vertex, i) {
            const amp = 2;
            const time = Date.now();
            vertex.z = (self.noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
        });

        mesh.geometry.verticesNeedUpdate = true;
        mesh.geometry.normalsNeedUpdate = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeFaceNormals();
    }
}