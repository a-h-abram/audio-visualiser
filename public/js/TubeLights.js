/**
 * Tubes lights that can spawn randomly
 */

class TubeLights {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;

        init();
    }

    init() {
        const options = this.options;

        let curve = new THREE.LineCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, -1)
        );
        let baseGeometry = new THREE.TubeBufferGeometry(curve, 25, 1, 8, false);
        let material = new THREE.MeshBasicMaterial({ color: 0x545454 });
        let mesh = new THREE.Mesh(baseGeometry, material);

        this.mesh = mesh;
        this.scene.add(mesh);
    }
}