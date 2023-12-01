const Constants = {
    UNIVERSE_SCALE: Math.pow(10, -4.2), // 4.2
    CELESTIAL_SCALE: Math.pow(10, -3.8), // 3.9
    ORBIT_SCALE: Math.pow(10, -4.2), // 4.2
    DEGREES_TO_RADIANS_RATIO: 0.0174532925,
    RADIANS_TO_DEGREES_RATIO: 57.2957795,

    planetsDecrementRadius: 0.01, // Reduce planet km radius 
    planetsRadiusScale: 4.0,
    planetsDistanceScale: 25000, // using vectors,
    planetsRotationSpeed: 1.0

};

export default Constants;