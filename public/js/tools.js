/**
 * @param min
 * @param max
 * @returns {number}
 */
Number.prototype.clamp = (min, max) => {
    return Math.min(Math.max(this, min), max);
};
