// import { random } from "./lib";
import { Perlin3D } from "./perlin3D";

const vert = /* glsl */`
    precision mediump float;

    varying vec2 vUv;
    varying vec3 pos;
    // varying vec3 vNormal;
    // varying vec3 vViewPosition;

    uniform float time;
    uniform float radius;
    uniform float speed;
    uniform vec3 noise_values;

    ${Perlin3D}

    float noise(vec3 p){
            return cnoise(vec4(p, time * speed));
    }

    void main() {
        vUv = uv;
        csm_Position = position * (noise_values.x + noise(position * noise_values.y) * noise_values.z) * radius;;
    }
`

export default vert;
