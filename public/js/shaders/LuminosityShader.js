THREE.LuminosityShader = {

    uniforms: {
        "tDiffuse": { value: null },
        "luminosity": {value: 1}
    },

    vertexShader: [
        "varying vec2 vUv;",

        "void main() {",
        "	vUv = uv;",
        "	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
        "}"
    ].join("\n"),

    fragmentShader: [
        "uniform sampler2D tDiffuse;",
        "uniform float luminosity;",
        "varying vec2 vUv;",

        "void main() {",
        "	gl_FragColor = texture2D(tDiffuse, vUv) * luminosity;",
        "}"

    ].join("\n")

};
