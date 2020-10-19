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

        this.scene = new THREE.Scene();

        this.setupRenderer();
        this.setupCamera();
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
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.camera.position.set(0, 0, 100);
    };

    setupLights = () => {
        const ambientLight = new THREE.AmbientLight(0xaaaaaa);
        this.scene.add(ambientLight);

        let light = new THREE.DirectionalLight(0xffffff, 1.0);

        light.position.set(0, 0, 400);

        this.scene.add(light);

        let pointLight = new THREE.PointLight(0xffffff, 1000, 100);

        pointLight.position.set(0, 10, 10);

        // this.camera.lookAt(pointLight.position);
        this.scene.add(pointLight)
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
        let geometry = new THREE.CubeGeometry(15, 15, 15);
        let material = new THREE.MeshPhongMaterial({ color: 0xff0000, wireframe: true });
        let cubeMesh = new THREE.Mesh(geometry, material);

        this.scene.add(cubeMesh);
        this.meshes.push(cubeMesh);

        const planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
        const planeMaterial = new THREE.MeshLambertMaterial({
            color: 0x6904ce,
            side: THREE.DoubleSide,
            wireframe: true
        });

        let plane = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.rotation.x = -0.5 * Math.PI;
        plane.position.set(0, -30, 0);

        // this.camera.lookAt(plane.position);

        this.scene.add(plane);
        this.meshes.push(plane);
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

    animate = () => {
        requestAnimationFrame(this.animate);

        if (!this.audioVisualiser.audioLoaded) {
            // TODO: Initiliazing the song
            const loadPercentage = this.audioVisualiser.loading;

            this.loadingBar.style.width = loadPercentage + "%";

            if (loadPercentage === 100) {
                this.loading = false;
                this.audioLoaded = true;
            }
            // TODO: play song "Audio has been initilized ..."
        } else {
            this.audioVisualiser.render();
        }

        this.meshes[0].rotation.x += 0.01;
        this.meshes[0].rotation.y += 0.02;

        this.updateRgbShift();

        this.composer.render();
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