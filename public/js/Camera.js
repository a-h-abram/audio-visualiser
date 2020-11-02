/**
 * Encapsulated camera
 * It uses GSAP to move the camera
 */

class Camera {
    constructor() {
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.camera.position.set(0, 0, 80);

        this.nextPosition = null; // THREE.Vector3
        this.duration = 2; // in seconds
        this.isMoving = false;
        this.scenePos = null;
        this.nextScenePos = null;
    }

    update = () => {
        if (this.nextPosition) {
            gsap.to(this.camera.position, {
                x: this.nextPosition.x,
                y: this.nextPosition.y,
                z: this.nextPosition.z,
                duration: this.duration,
                // ease: Power2.easeInOut
            });

            if (this.nextPosition.y - 1 < this.camera.position.y) {
                this.scenePos = this.nextScenePos;
                this.nextScenePos = null;
                this.nextPosition = null;
                this.isMoving = false;
            }
        }
    };

    moveTo = (nextPosition, duration = 2, nextScenePos = null) => {
        this.nextPosition = nextPosition;
        this.duration = duration;
        this.nextScenePos = nextScenePos;
        this.isMoving = true;
    };

    moveTop = (duration = 2, nextScenePos = null) => {
        this.nextPosition = new THREE.Vector3(0, 500, 80);
        this.duration = duration;
        this.nextScenePos = nextScenePos;
        this.isMoving = true;
    };

    moveBot = (duration = 2, nextScenePos = null) => {
        this.nextPosition = new THREE.Vector3(0, 0, 80);
        this.duration = duration;
        this.nextScenePos = nextScenePos;
        this.isMoving = true;
    };
}
