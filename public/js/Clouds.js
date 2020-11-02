class Clouds {
    constructor(scene, cloudNbr = 400, cloudTexture = 'imgs/smoke.png', height = 250) {
        this.scene = scene;
        this.cloudNbr = cloudNbr;
        this.cloudTexture = cloudTexture;
        this.height = height;
        this.enabled = true;
        this.allMoved = true;
        this.willFlash = false;
        this.cloudParticles = [];
        this.flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);

        this.flash.position.set(200, this.height - 50, 100);
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
                    Math.random() * 1000 - 500,
                    this.height,
                    Math.random() * 500 - 450
                );

                //cloud.rotation.x = 1.16;
                cloud.rotation.x = 2 * Math.PI;
                cloud.rotation.y = -0.12;
                cloud.rotation.z = Math.random() * 360;
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
                cloud.position.z = Math.random() * 500 - 450;
            }

            /*if (!this.enabled && !this.allMoved) {
                cloud.position.y += 0.5;
            } else if (this.enabled && !this.allMoved) {
                cloud.position.y -= 0.5;
            }

            this.allMoved = true;

            if (!this.enabled && cloud.position.y < 500) {
                this.allMoved = false;
            } else if (this.enabled && cloud.position.y > 250) {
                this.allMoved = false;
            }*/
        });

        if (this.willFlash) {
            if (this.flash.power < 100) {
                this.flash.position.set(
                    Math.random() * 400,
                    (this.height - 50) + Math.random() * 200,
                    100
                );
            }

            this.flash.power = 50 + Math.random() * 1000;
            this.willFlash = false;
        } else if (!this.willFlash && this.flash.power > 100) {
            this.flash.power = 0;
        }
    };

    disable = () => {
        this.enabled = false;
        this.allMoved = false;
    };

    enable = () => {
        this.enabled = true;
        this.allMoved = false;
    }
}
