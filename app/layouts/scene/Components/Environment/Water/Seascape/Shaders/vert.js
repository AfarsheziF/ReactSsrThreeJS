const vert = /* glsl */`

varying vec2 surfacePosition;
// varying vec2 vUv;
// varying vec3 pos;

void main() {
    surfacePosition = uv;
    vec4 pos = vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * pos;
}
`

export default vert;