// import { Simplex3D } from "../../../Shaders/Noise/Simplex3D";

const frag = /* glsl */`

    // Uniforms
    uniform vec3 color;
    uniform vec3 noise_values;
    uniform float time;
    uniform float speed;
    uniform float alpha;
    uniform float scale;

    varying vec2 vUv;
    varying float vNoise;

    void main() {
        // gl_FragColor = vec4( color, 1.0 );

        // float vLineIndex = 0.0;
        // float alpha = 0.0;
        // float animValue = pow(abs(noise_values.z * 2.0 - 1.0), 12.0 - vLineIndex * 5.0);
        // float threshold = animValue * 0.5 + 0.5;
        // alpha += 0.15 * (threshold, 0.4 * snoise(vec3(vUv * noise_values.x, time)));
        // alpha += 0.35 * (threshold, 0.1 * snoise(vec3(vUv * noise_values.y, time)));
        // alpha += 0.15 * (threshold);

        // alpha += scale * snoise(vec3(vUv * noise_values.x, time));
        // alpha += scale * snoise(vec3(vUv * noise_values.y, time));
        // alpha += scale * snoise(vec3(vUv * noise_values.z, time));

        // gl_FragColor = vec4(color, alpha) * strength;
        // csm_Metalness = vNoise;
        // csm_Roughness
        // csm_Emissive = color * vNoise;

        csm_DiffuseColor = vec4(color, vNoise) * alpha;

    }

`

export default frag;