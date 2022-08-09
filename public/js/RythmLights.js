/**
 * Send lights from camera position to any visible direction randomly
 * Can send 2 or 3 lights at the same time
 * Should send multiple lights when the frequencies of the song are really high
 */
class RythmLights {
    // const
    LIGHT_HEIGHT = 20;
    LIGHT_DISTANCE = 100;
    LIGHT_INTENSITY = 10000;
    LIGHT_SPEED = 200;

    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.lights = [];
        this.lightsAvailable = [];

        const light1 = new THREE.PointLight(0x0000ff, this.LIGHT_INTENSITY, this.LIGHT_DISTANCE);

        light1.position.set(this.camera.position.x, this.LIGHT_HEIGHT, this.camera.position.z);
        light1.available = true;
        light1.index = 0;
        light1.power = 0;

        const light2 = new THREE.PointLight(0xff0000, this.LIGHT_INTENSITY, this.LIGHT_DISTANCE);

        light2.position.set(this.camera.position.x, this.LIGHT_HEIGHT, this.camera.position.z);
        light2.available = true;
        light2.index = 1;
        light2.power = 0;

        const light3 = new THREE.PointLight(0x008000, this.LIGHT_INTENSITY, this.LIGHT_DISTANCE);

        light3.position.set(this.camera.position.x, this.LIGHT_HEIGHT, this.camera.position.z);
        light3.available = true;
        light3.index = 2;
        light3.power = 0;

        this.lights.push(light1, light2, light3);
        this.lightsAvailable.push(light1, light2, light3);
        this.scene.add(light1, light2, light3);
    }

    // call this method to send randomly some lights
    sendLights = (highFreq = false) => {
        console.log("sendLights has been called");
        // no lights available
        if (this.lightsAvailable === 0) {
            return;
        }

        // randomly chose how many lights will be sent
        let nbrLightToSend = Math.floor(Math.random() * this.lightsAvailable.length) + 1;

        // clamp value if there is no highFreq in the music
        if (!highFreq && nbrLightToSend > 2) {
            nbrLightToSend = 2;
        }

        // console.log('nbrLightToSend:', nbrLightToSend);

        // allow us to chose randomly the lights that will be sent
        this.shuffleLights();

        for (let i = 0; i < nbrLightToSend && i < this.lightsAvailable.length; i++) {
            // chose randomly the direction
            const light = this.lightsAvailable[i];
            const direction = Math.floor(Math.random() * 3);

            switch (direction) {
                case 0: // left
                    light.direction = new THREE.Vector3(-0.5, 0, -1);
                    break;
                case 1: // middle
                    light.direction = new THREE.Vector3(0, 0, -1);
                    break;
                case 2: // right
                    light.direction = new THREE.Vector3(0.5, 0, -1);
                    break;
            }

            // console.log('dir:', direction);

            // send lights to pos
            light.available = false;
            light.position.set(this.camera.position.x, light.position.y, this.camera.position.z);
            light.power = 3000;

            this.lightsAvailable.splice(i, 1);
        }
    };

    update = () => {
        for (let i = 0; i < this.lights.length; i++) {
            if (!this.lights[i].available) {
                this.lights[i].position.x += this.lights[i].direction.x * this.LIGHT_SPEED;
                this.lights[i].position.z += this.lights[i].direction.z * this.LIGHT_SPEED;

                if (this.lights[i].position.z < -5000) {
                    this.lights[i].power = 0;
                    this.lights[i].available = true;
                    this.lightsAvailable.push(this.lights[i]);
                }
            }
        }
    };

    shuffleLights = () => {
        for (let i = this.lightsAvailable.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.lightsAvailable[i];

            this.lightsAvailable[i] = this.lightsAvailable[j];
            this.lightsAvailable[j] = temp;
        }
    }
}