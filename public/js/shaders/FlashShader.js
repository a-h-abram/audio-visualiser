THREE.FlashShader = {

    uniforms: {
        "tDiffuse": { value: null },
        "white": {value: 0}
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
        "uniform float white;",
        "varying vec2 vUv;",

        "void main() {",
        "	vec4 txt = texture2D(tDiffuse, vUv);",
        "	gl_FragColor.rgb = vec3(1.0) * white + txt.rgb * (1.0 - white);",
        "	gl_FragColor.a = txt.a;",
        "}"

    ].join("\n")

};
