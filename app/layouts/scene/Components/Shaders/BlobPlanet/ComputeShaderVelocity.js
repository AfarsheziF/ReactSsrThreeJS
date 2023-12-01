const ComputeShaderVelocity = /* glsl */`

    // precision highp float;

    #define PI 3.1415926535897932384626433832795
    #define TWO_PI PI*2.0
    #define HALF_PI PI/2.0

    uniform vec3 objectsPositions[50];
    uniform float objectsRadius[50];
    uniform float objectsInteracted[50];
    uniform int objectsCount;

    uniform vec3 origin;
    //uniform float velocity;
    uniform float time;
    uniform float seed;
    uniform float reset;
    uniform float collisionsClusterNoiseScale;
    
    float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

    float noise(vec3 p){
        vec3 a = floor(p);
        vec3 d = p - a;
        d = d * d * (3.0 - 2.0 * d);

        vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
        vec4 k1 = perm(b.xyxy);
        vec4 k2 = perm(k1.xyxy + b.zzww);

        vec4 c = k2 + a.zzzz;
        vec4 k3 = perm(c);
        vec4 k4 = perm(c + 1.0);

        vec4 o1 = fract(k3 * (1.0 / 41.0));
        vec4 o2 = fract(k4 * (1.0 / 41.0));

        vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
        vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

        return o4.y * d.y + o4.x * (1.0 - d.y);
    }


    // reads and writes textureVelocity increasing brightness = offset (red channel)
    void main(){

        vec2 uv = gl_FragCoord.xy / resolution.xy; // position in this texture

        vec4 vel = texture2D( textureVelocity, uv );
        vec4 pos = texture2D( textureBlurPos, uv );

        // if (reset == 1.0){
        //     vel.w = 0.0;
        // }

        // Check for stored collision
        if(vel.w == 0.0) {
            for(int i = 0; i < objectsCount; i++){
                float dis = distance(pos.xyz, objectsPositions[i] - origin );
                // float radiusWithMargin = objectsRadius[i] + 50.0;
                float planetRadius = objectsRadius[i];
                if (dis < planetRadius) {
                    // objectsInteracted[i] = 1.0;

                    //float c = (clamp(dis, radiusWithMargin + 20.0, radiusWithMargin + 70.0) - radiusWithMargin - 20.0) / 50.0;
                    //float velPower = smoothstep(radiusWithMargin - 50.0, radiusWithMargin + 50.0, dis);
                    //velMult *= (c * c);
                    
                    float scale = 1.0 / planetRadius;

                    //vel.w = 1.0 + mod(pos.x / pos.y * pos.z, 3.0);

                    // defines the cluster density of types
                    vel.w = 1.0 + noise(pos.xyz * scale * collisionsClusterNoiseScale + seed) * 3.0;
                    int type = int(vel.w);
                    switch(type) {
                        case 1: // slowdown
                            vel *= 0.5; 
                            break;
                        case 3: // random bounce
                        float bounceEnergyLoss = 0.8;
                        float mag = length(vel.xyz) * bounceEnergyLoss;
                            vel.x = noise(pos.xyz * scale);
                            vel.y = noise(pos.zxy * scale);
                            vel.z = noise(pos.yzx * scale);
                            vel = (vel * 2.0 - 1.0) * mag;
                            break;
                        default: // freeze
                            vel *= 0.0; 
                            break;
                    }
                    break;
                }
            }    
        }

        gl_FragColor = vel;
}

`

export default ComputeShaderVelocity;