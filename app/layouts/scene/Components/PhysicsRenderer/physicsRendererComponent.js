import * as THREE from "../../../../../vendor_mods/three/build/three.module.js";

var SIZE = 512;
var RADIUS = 10;
var simulation;

var simulationUniforms = {
  dT: { type: "f", value: 0 },
  colliderPositions: { type: "v3v", value: [] },
  radius: { type: "f", value: RADIUS },
}

var renderUniforms = {
  t_pos: { type: "t", value: null }
}

const physicsRendererComponent = {

  init(scene, renderer) {
    var shaders = new ShaderLoader('images/shaders');
    shaders.load('ss-collisions', 'sim', 'simulation');
    shaders.load('vs-lookup', 'lookup', 'vertex');
    shaders.load('fs-lookup', 'lookup', 'fragment');

    shaders.shaderSetLoaded = function () {
      console.log("on shaderSetLoaded");
      let geo = new THREE.IcosahedronGeometry(10, 2);
      let mat = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: .3
      });

      for (let i = 0; i < 10; i++) {
        let mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        mesh.position.x = (Math.random() - .5) * 100;
        mesh.position.y = (Math.random() - .5) * 100;
        mesh.position.z = (Math.random() - .5) * 100;
        simulationUniforms.colliderPositions.value.push(mesh.position);
      }

      let numOf = simulationUniforms.colliderPositions.value.length;
      let ss = shaders.setValue(shaders.ss.sim, 'COLLIDERS', numOf);
      simulation = new PhysicsRenderer(SIZE, ss, renderer, THREE);

      geo = physicsRendererComponent.createLookupGeometry(SIZE);

      mat = new THREE.ShaderMaterial({
        uniforms: renderUniforms,
        vertexShader: shaders.vs.lookup,
        fragmentShader: shaders.fs.lookup,
        blending: THREE.AdditiveBlending,
        transparent: true

      });

      simulation.setUniforms(simulationUniforms);

      let particles = new THREE.Points(geo, mat);
      particles.frustumCulled = false;
      scene.add(particles);

      simulation.addBoundTexture(renderUniforms.t_pos, 'output');
      simulation.resetRand(5);
    }
  },

  createLookupGeometry(size) {

    let geo = new THREE.BufferGeometry();

    // geo.addAttribute( 'position', Float32Array , size * size , 3 );
    let positions = new Float32Array(size * size * 3);

    for (let i = 0, j = 0, l = positions.length / 3; i < l; i++, j += 3) {
      positions[j] = (i % size) / size;
      positions[j + 1] = Math.floor(i / size) / size;
      //positions[ j + 2 ] = Math.sin( (i / size) * Math.PI );
    }

    let posA = new THREE.BufferAttribute(positions, 3);
    geo.setAttribute('position', posA);

    return geo;
  },

  update() {

  },

  render(deltaTime) {
    if (simulation) {
      simulationUniforms.dT.value = deltaTime;
      simulation.update();
    }
  }

}

export default physicsRendererComponent;