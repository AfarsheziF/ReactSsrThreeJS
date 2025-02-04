const Common = `

	const int PARTICLE_COUNT = 5;
	const float PARTICLE_SIZE = .2;
	const float PARTICLE_EDGE_SMOOTHING = .003;
	const float WALL_THINNESS = 60.;
	const float MAX_VELOCITY = 0.004;
	const float MAX_VELOCITY_CHANGE = 0.0003;
	const float FOCAL_POINT_TENDENCY = .0002;

	const float PI = 3.1415926535897932384626433832795;
	const int POSITION_ROW = 0;
	const int VELOCITY_ROW = 1;
	const int COLOR_ROW = 2;
	const int LAST_ROW = COLOR_ROW;
	const vec4 COLOR_ZERO = vec4(0);
	const vec2 VEC2_ZERO = vec2(0);
	const vec2 HORIZONTAL_REVERSE = vec2(-1., 1.);
	const vec2 VERTICAL_REVERSE = vec2(1., -1.);

	/*

	BEGIN: store vector on texture functions

	taken from here:

	https://gist.github.com/Flexi23/1713774

	These are the helper functions to store and to restore a 2D vector with a custom 16 floating point precision in a texture.
	The 16 bit are used as follows: 1 bit is for the sign, 4 bits are used for the exponent, the remaining 11 bit are for the mantissa.

	The exponent bias is asymmetric so that the maximum representable number is 2047 (and bigger numbers will be cut)
	the accuracy from 1024 - 2047 is one integer
	512-1023 it's 1/2 int
	256-511 it's 1/4 int and so forth...
	between 0 and 1/16 the accuracy is the highest with 1/2048 (which makes 1/32768 the minimum representable number)

	So this is a non-IEEE implementation (which would be a 5 bit exponent with a symmetric bias from 2^-15 to 2^16 and a 10 bit mantissa)

	I hope anyone else knows a purpose for such a buffer and can use it too (in a fragment shader). ;)

	Felix Woitzel, Jan/Feb 2012
	(Twitter: @Flexi23)

	attention: this is only tested on a AMD Radeon HD series chip so far and there might be oddities with Intel and Nvidia. I'll try and test it on other chips soon.

	store: "gl_FragColor = encode2( v );"
	restore: "vec2 v = decode2( texture2D( encoded_sampler, coord) );"

	*/

	vec2 encode(float v){
		vec2 c = vec2(0.);

		int signum = (v >= 0.) ? 128 : 0;
		v = abs(v);
		int exponent = 15;
		float limit = 1024.; // considering the bias from 2^-5 to 2^10 (==1024)
		for(int exp = 15; exp > 0; exp--){
			if( v < limit){
				limit /= 2.;
				exponent--;
			}
		}

		float rest;
		if(exponent == 0){
			rest = v / limit / 2.;		// "subnormalize" implicite preceding 0. 
		}else{
			rest = (v - limit)/limit;	// normalize accordingly to implicite preceding 1.
		}

		int mantissa = int(rest * 2048.);	// 2048 = 2^11 for the (split) 11 bit mantissa
		int msb = mantissa / 256;		// the most significant 3 bits go into the lower part of the first byte
		int lsb = mantissa - msb * 256;		// there go the other 8 bit of the lower significance

		c.x = float(signum + exponent * 8 + msb) / 255.;	// color normalization for texture2D
		c.y = float(lsb) / 255.;

		if(v >= 2048.){
			c.y = 1.;
		}

		return c;
	}

	float decode(const vec2 c){
		float v = 0.;

		int ix = int(c.x*255.); // 1st byte: 1 bit signum, 4 bits exponent, 3 bits mantissa (MSB)
		int iy = int(c.y*255.);	// 2nd byte: 8 bit mantissa (LSB)

		int s = (c.x >= 0.5) ? 1 : -1;
		ix = (s > 0) ? ix - 128 : ix; // remove the signum bit from exponent
		int iexp = ix / 8; // cut off the last 3 bits of the mantissa to select the 4 exponent bits
		int msb = ix - iexp * 8;	// subtract the exponent bits to select the 3 most significant bits of the mantissa

		int norm = (iexp == 0) ? 0 : 2048; // distinguish between normalized and subnormalized numbers
		int mantissa = norm + msb * 256 + iy; // implicite preceding 1 or 0 added here
		norm = (iexp == 0) ? 1 : 0; // normalization toggle
		float exponent = pow( 2., float(iexp + norm) - 16.); // -5 for the the exponent bias from 2^-5 to 2^10 plus another -11 for the normalized 12 bit mantissa 
		v = float( s * mantissa ) * exponent;

		return v;
	}

	vec4 encode2(const vec2 v){
		return vec4(encode(v.x), encode(v.y));
	}
			
	vec2 decode2(const vec4 c){
		return vec2(decode(c.rg), decode(c.ba));
	}

	/* END: store vector on texture functions */

	float randImpl(const vec2 co) {
		return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
	}

	#define tex(ch, x, y) texelFetch(ch, ivec2(x, y), 0)

	#define rand(seed) randImpl(seed + mod(iTime, PI)) 

	#define getParticleRawColor(row, index) tex(iChannel0, index, row) 

	#define getParticleVector(row, index) decode2(getParticleRawColor(row, index))

	#define getParticlePosition(index) getParticleVector(POSITION_ROW, index)

	#define getParticleVelocity(index) getParticleVector(VELOCITY_ROW, index)

	#define getParticleColor(index) getParticleRawColor(COLOR_ROW, index)
`

export default Common;