/**
 * @param min
 * @param max
 * @returns {number}
 */
Number.prototype.clamp = (min, max) => {
    return Math.min(Math.max(this, min), max);
};

Number.prototype.randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}

const randomBetween = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};
