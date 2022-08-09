class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    copy = (vec) => {
        if (!vec ||typeof vec === 'undefined') {
            console.error("Vector2::copy", "Vector passed in parameter is null or undefined");
            return;
        }
        
        this.x = vec.x;
        this.y = vec.y;
    }

    multiply = (vec) => {
        this.x *= vec.x;
        this.y *= vec.y;
    }

    add = (vec) => {
        this.x += vec.x;
        this.y += vec.y;
    }

    sub = (vec) => {
        this.x -= vec.x;
        this.y -= vec.y;
    }

    distance = (vec) => {
        const x = vec.x - this.x;
        const y = vec.y - this.y;

        return (x * x) + (y * y); // we do not operate a sqrt to avoid useless computation time
    }
}