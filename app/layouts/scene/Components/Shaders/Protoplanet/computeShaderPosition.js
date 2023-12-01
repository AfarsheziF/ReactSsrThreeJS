const computeShaderPosition = /* glsl */`
    
    #define delta ( 1.0 / 60.0 )

    uniform vec3 origin;
    uniform float time;
    uniform float lifetime;
    uniform float velocity;

    void main() {

        vec2 uv = gl_FragCoord.xy / resolution.xy;

        vec4 tmpPos = texture2D( texturePosition, uv );
        vec3 pos = tmpPos.xyz;

        vec4 tmpVel = texture2D( textureVelocity, uv );
        vec3 vel = tmpVel.xyz;
        float mass = tmpVel.w;

        if ( mass == 0.0 ) {
            vel = vec3( 0.0 );
        }

        // Dynamics
        pos += vel * velocity * delta;

        // float ptime = tmpPos.w + 1.0;
        // float ptime = tmpPos.w + time;
        // float ptime = time;
        float pLifeTime = tmpPos.w;
        if ( time > pLifeTime  ) // 3600.0 as 60 fps * 60s (3600 frames per minute). Or use running time
        {
            pos = vec3(0.);
            // pos = origin;
            // ptime = 0.;
            // ptime = 5.0 + time;
            pLifeTime = time + lifetime;
        }
        // gl_FragColor = vec4( pos, ptime );
        gl_FragColor = vec4( pos, pLifeTime );
        // gl_FragColor = pos;

    }
`

export default computeShaderPosition;