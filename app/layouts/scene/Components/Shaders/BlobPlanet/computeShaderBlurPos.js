const ComputeShaderBlurPos = /* glsl */`

vec4 blur13(sampler2D image, vec2 uv, vec2 res, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.411764705882353) * direction;
    vec2 off2 = vec2(3.2941176470588234) * direction;
    vec2 off3 = vec2(5.176470588235294) * direction;
    color += texture2D(image, uv) * 0.1964825501511404;
    color += texture2D(image, uv + (off1 / res)) * 0.2969069646728344;
    color += texture2D(image, uv - (off1 / res)) * 0.2969069646728344;
    color += texture2D(image, uv + (off2 / res)) * 0.09447039785044732;
    color += texture2D(image, uv - (off2 / res)) * 0.09447039785044732;
    color += texture2D(image, uv + (off3 / res)) * 0.010381362401148057;
    color += texture2D(image, uv - (off3 / res)) * 0.010381362401148057;
    return color;
  }
  
  

vec4 blur9(sampler2D image, vec2 uv, vec2 res, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.3846153846) * direction;
    vec2 off2 = vec2(3.2307692308) * direction;
    color += texture2D(image, uv) * 0.2270270270;
    color += texture2D(image, uv + (off1 / res)) * 0.3162162162;
    color += texture2D(image, uv - (off1 / res)) * 0.3162162162;
    color += texture2D(image, uv + (off2 / res)) * 0.0702702703;
    color += texture2D(image, uv - (off2 / res)) * 0.0702702703;
    return color;
  }


/**
 * Blurs the position texture to avoid sharp edges. Not in use
 */
 void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy; // coords in this texture

    //gl_FragColor = blur13(texturePosition, uv, resolution.xy, vec2(1.0, 0.0));
    gl_FragColor = texture2D(texturePosition, uv);
}

`

export default ComputeShaderBlurPos;