const ComputeShaderPosition = /* glsl */`

    uniform float velocity;
    uniform float reset;

/**
 * Renders the texture with the positions of the vertices
 */
    void main(){
        vec2 uv = gl_FragCoord.xy / resolution.xy; // coords in this texture

        vec4 vel = texture2D( textureVelocity, uv );
        vec4 pos = texture2D( texturePosition, uv );

        gl_FragColor = pos + vel * velocity;
        gl_FragColor.a = vel.a;
}

`

export default ComputeShaderPosition;