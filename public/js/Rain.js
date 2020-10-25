/**
 * Setup rain on the current scene
 * For efficiency reasons, the rain is only one object on the scene & its vertices are the rain drops
 * Per default, the rain is invisible, you need to call enable() method to set it visible in the scene
 */
class Rain {
    constructor(rainNbr = 1500) {
        this.rainNbr = rainNbr;
        this.enabled = false;
        this.rainGeometry = new THREE.Geometry();

        for (let i = 0; i < this.rainNbr; i++) {
            let rainDrop = new THREE.Vector3(
                Math.random() * 400 - 200,
                Math.random() * 500 - 250,
                Math.random() * 400 - 200,
            );

            rainDrop.velocity = {};
            rainDrop.velocity = 0;

            this.rainGeometry.vertices.push(rainDrop)
        }

        const material = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: false
        });

        this.mesh = new THREE.Points(this.rainGeometry, material);
        this.mesh.visible = false;
        this.mesh.position.set(0, 10, 100);
    }

    update = () => {
        if (!this.enabled) {
            return;
        }

        this.rainGeometry.vertices.forEach((point) => {
            point.velocity -= 0.1 + Math.random() * 0.1;
            point.y += point.velocity; // move rain drops

            // reset rain drops position if they are outside the screen
            if (point.y < -200) {
                point.y = 200;
                point.velocity = 0;
            }
        });

        this.rainGeometry.verticesNeedUpdate = true;
    };

    disable = () => {
        this.enabled = false;
        this.mesh.visible = false;

        // we reset the rain drops position
        this.rainGeometry.vertices.forEach((point) => {
            point.y = 200;
            point.velocity = 0;
        });
    };

    enable = () => {
        this.enabled = true;
        this.mesh.visible = true;
    }
}