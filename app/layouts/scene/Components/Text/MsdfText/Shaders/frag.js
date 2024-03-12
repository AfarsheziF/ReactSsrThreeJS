import { Simplex3D } from "../../../Shaders/Noise/Simplex3D";

const frag = /* glsl */`
// #extension GL_OES_standard_derivatives : enable
precision highp float;

// Uniforms: Common
uniform float uOpacity;
uniform float uThreshold;
uniform float uAlphaTest;
uniform vec3 uColor;
uniform sampler2D uMap;

// Uniforms: Strokes
uniform vec3 uStrokeColor;
uniform float uStrokeOutsetWidth;
uniform float uStrokeInsetWidth;

// Uniforms
uniform vec3 noise_values;
uniform float time;
uniform float speed;
uniform float strength;

// Varyings
varying vec2 vUv;
varying vec2 vLayoutUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying float vLineIndex;
varying float vLineLettersTotal;
varying float vLineLetterIndex;
varying float vLineWordsTotal;
varying float vLineWordIndex;
varying float vWordIndex;
varying float vLetterIndex;
varying float vTime;
varying vec3 vNoise;

${Simplex3D}

// Utils: Median
float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
  // Common
  // Texture sample
  vec3 s = texture2D(uMap, vUv).rgb;

  // Signed distance
  float sigDist = median(s.r, s.g, s.b) - 0.5;

  float afwidth = 1.4142135623730951 / 2.0;

  #ifdef IS_SMALL
  float alpha = smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDist);
  #else
  float alpha = clamp(sigDist / fwidth(sigDist) + 0.5, 0.0, 1.0);
  #endif

  // Strokes
  // Outset
  float sigDistOutset = sigDist + uStrokeOutsetWidth * 0.5;

  // Inset
  float sigDistInset = sigDist - uStrokeInsetWidth * 0.5;

  #ifdef IS_SMALL
  float outset =
    smoothstep(uThreshold - afwidth, uThreshold + afwidth, sigDistOutset);
  float inset = 1.0 - smoothstep(uThreshold - afwidth, uThreshold + afwidth,
      sigDistInset);
  #else
  float outset = clamp(sigDistOutset / fwidth(sigDistOutset) + 0.5, 0.0, 1.0);
  float inset =
    1.0 - clamp(sigDistInset / fwidth(sigDistInset) + 0.5, 0.0, 1.0);
  #endif

  // Border
  float border = outset * inset;

  // Alpha Test
  if (alpha < uAlphaTest)
    discard;

  // Output: Common
  vec4 filledFragColor = vec4(uColor, uOpacity * alpha);

  // Output: Strokes
  vec4 strokedFragColor = vec4(uStrokeColor, uOpacity * border);

  // gl_FragColor = mix(filledFragColor, strokedFragColor, border);
  // gl_FragColor = filledFragColor;

  alpha = 0.0;
  float animValue =
    pow(abs(noise_values.z * 2.0 - 1.0), 12.0 - vLineIndex * 5.0);
  float threshold = animValue * 0.5 + 0.5;
  alpha += 0.15 * (threshold, 0.4 * snoise(vec3(vUv * noise_values.x, vTime)));
  alpha += 0.35 * (threshold, 0.1 * snoise(vec3(vUv * noise_values.y, vTime)));
  // alpha += 0.15 * (threshold);
  gl_FragColor = vec4(filledFragColor.rgb, alpha) * strength;
}

`

export default frag;