const ComputeShaderNormal = /* glsl */`


/**
 * Renders the texture with the normals based on the current vertrex positions
 */
 void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy; // coords in this texture
    vec3 uvOffsets = vec3(1.0 / resolution.x, 1.0 / resolution.y, 0.0);

    vec4 pos = texture2D( textureBlurPos, uv );
    vec3 calcNormal;

    vec3 up = texture2D(textureBlurPos, uv + uvOffsets.zy).xyz - pos.xyz;
    vec3 left = texture2D(textureBlurPos, uv - uvOffsets.xz).xyz - pos.xyz;
    vec3 down = texture2D(textureBlurPos, uv - uvOffsets.zy).xyz - pos.xyz;
    vec3 right = texture2D(textureBlurPos, uv + uvOffsets.xz).xyz - pos.xyz;

    calcNormal = 0.441 * (normalize(cross(up, left)) + normalize(cross(down, right)));

    vec3 ul = texture2D(textureBlurPos, uv + uvOffsets.zy - uvOffsets.xz).xyz - pos.xyz;
    vec3 ur = texture2D(textureBlurPos, uv + uvOffsets.xy).xyz - pos.xyz;
    vec3 dl = texture2D(textureBlurPos, uv - uvOffsets.xy).xyz - pos.xyz;
    vec3 dr = texture2D(textureBlurPos, uv - uvOffsets.zy + uvOffsets.xz).xyz - pos.xyz;

    calcNormal += 0.279 * (normalize(cross(ul, ur)) + normalize(cross(dr, dl)));

    calcNormal = normalize(calcNormal);

    gl_FragColor = vec4(calcNormal, pos.w);
    //gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
    //gl_FragColor = texture2D( textureNormal, uv );
}

`

export default ComputeShaderNormal;