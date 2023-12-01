const BlobShaderVS = /* glsl */`

// precision highp float;

// = object.matrixWorld
// uniform mat4 modelMatrix;

// // = camera.matrixWorldInverse * object.matrixWorld
// uniform mat4 modelViewMatrix;

// // = camera.projectionMatrix
// uniform mat4 projectionMatrix;

// // = camera.matrixWorldInverse
// uniform mat4 viewMatrix;

// // = inverse transpose of modelViewMatrix
// uniform mat3 normalMatrix;

// // = camera position in world space
// uniform vec3 cameraPosition;

// attribute vec3 position;
// attribute vec3 normal;
// attribute vec2 uv;

uniform sampler2D vertPosTexture;
uniform sampler2D vertNormalTexture;
uniform sampler2D velTexture;

uniform vec3 origin;
uniform float time;

varying vec3 vPos;
varying vec3 vVel;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vPos = texture2D(vertPosTexture, uv).xyz;
    vNormal = normalize(normalMatrix * texture2D(vertNormalTexture, uv).xyz);
    vVel = texture2D(velTexture, uv).xyz;
    vUv = uv;

    vec4 pos = projectionMatrix * modelViewMatrix * vec4( vPos, 1.0 );
    gl_Position = pos;
}

`

export default BlobShaderVS;