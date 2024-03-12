// import { Simplex3D } from "../../../Shaders/Noise/Simplex3D";
import { Perlin3D } from "../../../Shaders/Noise/perlin3D";

const vert = /* glsl */`
    // precision highp float;

    varying vec2 vUv;
    varying float vNoise;
    varying vec3 vRadius;

    // Uniforms
    uniform vec3 color;
    uniform vec3 noise_values;
    uniform float time;
    uniform float speed;
    uniform float scale;
    uniform vec3 radius;

    ${Perlin3D}

    float noise(vec3 p){
        return cnoise(vec4(p, time * speed));
    }

    void main() {
        vUv = uv;
        vRadius = radius;

        // gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

        float n = (noise_values.x + noise(normalize(position) * noise_values.y) * noise_values.z) * scale;
        vNoise = n;

        vec3 pos = position + n;

        // vec4 csm_test;
        csm_Position = pos;
        // csm_Normal =  pos;
        // csm_PositionRaw	= vec4( pos , 1);
    }
`

export default vert;