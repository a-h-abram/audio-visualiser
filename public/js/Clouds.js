class Clouds {
    constructor(scene, cloudNbr = 1000, cloudTexture = 'imgs/smoke.png', height = 250) {
        this.scene = scene;
        this.cloudNbr = cloudNbr;
        this.cloudTexture = cloudTexture;
        this.height = height;
        this.enabled = true;
        this.allMoved = true;
        this.willFlash = false;
        this.cloudParticles = [];
        this.flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);

        this.shuffleFlashPosition();

        this.scene.add(this.flash);

        let loader = new THREE.TextureLoader();

        loader.load(window.location.href + this.cloudTexture, (texture) => {
            const cloudGeo = new THREE.PlaneBufferGeometry(200, 200);
            const cloudMaterial = new THREE.MeshLambertMaterial({
                map: texture,
                transparent: true
            });

            for (let i = 0; i < this.cloudNbr; i++) {
                let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);

                cloud.position.set(
                    randomBetween(-1000, 1000),
                    this.height,
                    randomBetween(-1000, -100)
                );

                //cloud.rotation.x = 1.16;
                cloud.rotation.x = 2 * Math.PI;
                cloud.rotation.y = -0.12;
                cloud.rotation.z = randomBetween(1, 360);
                cloud.material.opacity = 0.6;

                this.cloudParticles.push(cloud);
                this.scene.add(cloud);
            }
        });
    }

    update = () => {
        if (!this.enabled && this.allMoved) {
            return;
        }

        this.cloudParticles.forEach(cloud => {
            // cloud.rotation.z -= 0.002;
            cloud.position.z += 0.4;

            if (cloud.position.z > -50) {
                cloud.position.z = randomBetween(-1000, -100);
            }
        });

        if (this.willFlash) {
            if (this.flash.power < 100) {
                this.shuffleFlashPosition();
            }

            this.flash.power = randomBetween(900, 3000);
            this.willFlash = false;
        } else if (!this.willFlash && this.flash.power > 100) {
            this.flash.power = 0;
        }
    };

    shuffleFlashPosition = () => {
        this.flash.position.set(
            randomBetween(-900, 900), //Math.random() * 400,
            (this.height - 50) + randomBetween(1, 200),
            randomBetween(-300, 0)
        );
    }

    disable = () => {
        this.enabled = false;
        this.allMoved = false;
    };

    enable = () => {
        this.enabled = true;
        this.allMoved = false;
    }
}
