const particleFragmentShader = /* glsl */`
    precision highp float;

	// For PI declaration:
	#include <common>

    varying vec4 vColor;
    varying vec3 vNormal;
    varying vec2 vUV;
    varying float vDistance;

	uniform sampler2D texturePosition;
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 color;
    uniform float opacity;

    const int SAMPLES = 3;
    const float RADIUS = 0.01;

    //float dist(vec2 p0, vec2 pf){return sqrt((pf.x-p0.x)*(pf.x-p0.x)+(pf.y-p0.y)*(pf.y-p0.y));}

    float random (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

    void main() {
        // if ( vColor.y == 0.0 ) discard;

        float f = length( gl_PointCoord - vec2( 0.5, 0.5 ) );
        if ( f > 0.5 ) {
            discard;
        }
        vec2 st = (gl_PointCoord - vec2( 0.5, 0.5 )) * 2.;
        float dist = length(st);

        vec4 posTemp = texture2D( texturePosition, vUV );

        // if ( dist > 1. ) {
        //     discard;
        // }
        gl_FragColor = vColor * opacity;
        //float blend = 1. - dist * 4.;
        float shape = 1. - pow(dist, 4.);
        // float wave = (sin(dist * 30. - time * 2.) * .5 + .5);
        // vec3 col = vec3(shape * wave);

        // float luma = noise(st * 3.0 - vec2(posTemp.w) * 1. + time);
        // luma *= shape;
        // if (luma < .5) {
        //     discard;
        // }
        // gl_FragColor = vec4(color * vec3(luma), luma * opacity);

        // Debug grow
        // vec3 disColor = vec3(1.0, vDistance * 0.1, 1.0);
        // gl_FragColor = vec4(color * vec3(luma) * disColor, luma * opacity);
    }
`

export default particleFragmentShader;