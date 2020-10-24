/**
 * Barry Martin's Fractals
 * Formula: (x, y) -> (y - sign(x) * sqrt(abs(b * x - c)), a -x)
 * where a, b, c should be random parameters
 *
 * I adapted Barry's formula to generate orbits depending the music frequencies,
 * so a, b and c are not randomized completely
 */

class HopalongOrbits {
    // constants
    ORBITS_NUMBER = 8;
    ORBITS_POINTS_NUMBER = 10;

    constructor() {
        this.orbits = []; // contains all orbits generated
        this.a = Math.random();
        this.b = Math.random();
        this.c = Math.random();
    }

    generateOrbits = () => {
        for (let i = 0; i < this.ORBITS_NUMBER; i++) {
            for (let k = 0; k < this.ORBITS_POINTS_NUMBER; k++) {

            }
        }
    };

    // call this method to render orbits
    render = () => {

    };
}