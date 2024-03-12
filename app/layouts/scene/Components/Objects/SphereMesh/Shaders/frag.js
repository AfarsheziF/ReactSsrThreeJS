const frag = /* glsl */`

precision mediump float;

varying vec2 vUv;
varying vec3 pos;

uniform float time;
uniform vec3 color;
uniform sampler2D tDiffuse;
uniform sampler2D tNormal;

void main() {
    vec4 dif = texture2D( tDiffuse, vUv );
    // vec4 norm = texture2D( tNormal, vUv );

    vec3 view_nv  = normalize(vNormal);
    vec3 nv_color = view_nv * 0.5 + 0.5; 

    // gl_FragColor = vec4(color, 1.);
    // gl_FragColor = base;

    csm_DiffuseColor = vec4(color, 1.0) * dif;
    // csm_DiffuseColor = vec4(nv_color, 1.0);
}
`

export default frag