const particleVertexShader = /* glsl */`

	// For PI declaration:
	#include <common>

	uniform sampler2D texturePosition;
	uniform sampler2D textureVelocity;

	uniform float cameraConstant;
	uniform float density;
	uniform float time;
	uniform float size;
	uniform vec3 origin;
	uniform float pulsSpeed;
	uniform float growInc;
	uniform float growThreshold;

	varying vec4 vColor;
	varying vec3 vNormal;
	varying vec2 vUV;
	varying float vDistance;

	float radiusFromMass( float mass ) {
		// Calculate radius of a sphere from mass and density
		return pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
	}

	void main() {
		vec4 posTemp = texture2D( texturePosition, uv );
		vec3 pos = posTemp.xyz;

		vec4 velTemp = texture2D( textureVelocity, uv );
		vec3 vel = velTemp.xyz;
		float mass = velTemp.w;

		vColor = vec4( 1.0, mass / 250.0, 0.0, 1.0 );
		vNormal = vel;
		vUV = uv;

		vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

		// Calculate radius of a sphere from mass and density
		//float radius = pow( ( 3.0 / ( 4.0 * PI ) ) * mass / density, 1.0 / 3.0 );
		float radius = radiusFromMass( mass );
		// float radius = 5.0;
		// Apparent size in pixels
		if ( mass == 0.0 ) {
			gl_PointSize = 0.0;
		}
		else {
			vDistance = distance(pos + origin, origin);
			if(vDistance < growThreshold){
				vDistance = 1.0;
			} else {
				vDistance *= growInc;
			}
			// else {
			// 	vDistance = 1.0;
			// }
			// vDistance *= size * vDistance * 0.001;	
			gl_PointSize = radius * cameraConstant / ( - mvPosition.z ) * vDistance * size;
			// gl_PointSize *= (sin(length(pos) * .05 - time * 20.) * .5 + .5) * 5.;
			// gl_PointSize *= (sin(length(pos) * pulsSpeed - time * 5.) * .5 + .5) * size;
		}

		gl_Position = projectionMatrix * mvPosition;
	}
`

export default particleVertexShader;



// Particle size based on camera zoom level 1 / dist
// Wave period dependant on camera zoom level, thresholds based on log scale 1 / 10 / 100 /1000 etc. mod(log(x), 1.)
// unite the transmission in x groups waves