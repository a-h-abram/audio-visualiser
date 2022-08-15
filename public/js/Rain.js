/**
 * Setup rain on the current scene
 * For efficiency reasons, the rain is only one object on the scene & its vertices are the rain drops
 * Per default, the rain is invisible, you need to call enable() method to set it visible in the scene
 */
class Rain {
    constructor(scene, rainNbr = 1500, enabled = false) {
        this.scene = scene;
        this.rainNbr = rainNbr;
        this.enabled = enabled;
        this.rainGeometry = new THREE.Geometry();

        for (let i = 0; i < this.rainNbr; i++) {
            let rainDrop = new THREE.Vector3(
                randomBetween(200, 400),
                randomBetween(450, 600),
                randomBetween(200, 400)
            );

            rainDrop.velocity = 0;

            this.rainGeometry.vertices.push(rainDrop)
        }

        const material = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true
        });

        this.mesh = new THREE.Points(this.rainGeometry, material);
        this.mesh.visible = this.enabled;
        this.mesh.position.set(0, 10, 100);

        this.scene.add(this.mesh);
    }

    update = () => {
        if (!this.enabled) {
            console.log("Rain update cancelled");
            return;
        }

        this.rainGeometry.vertices.forEach((point) => {
            point.velocity -= 0.1 + randomBetween(1, 2);
            point.y += point.velocity; // move rain drops

            // reset rain drops position if they are outside the screen
            if (point.y < -200) {
                point.y = 200;
                point.velocity = 0;
            }
        });

        this.rainGeometry.verticesNeedUpdate = true;
        this.mesh.rotation.y += 0.002;
    };

    disable = () => {
        this.enabled = false;
        this.mesh.visible = this.enabled;

        // we reset the rain drops position
        this.rainGeometry.vertices.forEach((point) => {
            point.y = 200;
            point.velocity = 0;
        });
    };

    enable = () => {
        this.enabled = true;
        this.mesh.visible = this.enabled;
    }
}