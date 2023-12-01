import * as THREE from "../../../../../vendor_mods/three/build/three.module.js";

const OPTIONS = {
  fadeFactor: 0.1,
  scaleX: 0,
  scaleY: 0,
  rotationAngle: 0
}

const uvMatrix = new THREE.Matrix3();

const fadeShader = new THREE.ShaderMaterial({
  uniforms: {
    inputTexture: { value: null },
    fadeFactor: { value: OPTIONS.fadeFactor },
    uvMatrix: { value: uvMatrix }
  },
  vertexShader: /* glsl */` 
      uniform mat3 uvMatrix;
      varying vec2 vUv;
      void main () {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vUv = (uvMatrix * vec3(uv, 1.0)).xy;
      }
    `,
  fragmentShader: /* glsl */`
      uniform sampler2D inputTexture;
      uniform float fadeFactor;
      varying vec2 vUv;
      void main () {
        float dist = distance(vUv, vec2(0.5));
        vec4 texColor = texture2D(inputTexture, vUv);
        vec4 fadeColor = vec4(0.0, 0.0, 0.0, 1.0);
        gl_FragColor = mix(texColor, fadeColor, fadeFactor);
      }
    `
});

export default fadeShader;