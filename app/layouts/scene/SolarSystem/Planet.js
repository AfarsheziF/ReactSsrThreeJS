import * as THREE from "../../../../vendor_mods/three/build/three.module.js";
import Constants from './Constants';
// import Orbit from "./Orbit";

import visualComponents from "../Components/visualComponents";
import utils from '../../../utils/utils';

class Planet {

    data = null;
    radius = null;
    diameter = null;
    distance = null;
    parent = null;
    threeObj = null;
    initialPosition = null;

    constructor(data, parent, textureName, planetVector, evnParams) {
        return new Promise((resolve, reject) => {
            this.data = data;
            this.name = data.name;
            this.parent = parent;
            this.radius = this.createThreeRadius(data);
            this.scaledRadius = this.radius;
            this.diameter = this.createThreeDiameter(data);
            this.distance = parent ? parent.radius + (this.data.distanceFromParent * 0.00001 * Constants.planetsDistanceScale) : 0;

            if (this.parent) {
                this.scaledRadius = this.radius * Constants.planetsRadiusScale;
            }

            console.log(`Creating Planet: ${data.name}. Radius: ${this.radius}`);

            const that = this;
            const materialsType = utils.isMobile ? evnParams.materialsType_mobile : evnParams.materialsType;

            Promise.all([
                visualComponents.loadTexture(`images/${textureName}_COLOR.jpg`),
                visualComponents.loadTexture(`images/${textureName}_BUMP.jpg`),
                visualComponents.loadTexture(`images/${textureName}_NRM.jpg`),
                data.rings && visualComponents.loadTexture(`images/${textureName}_RINGS_COLOR.jpg`)
            ])
                .then(
                    function (res) {
                        that.threeObj = new THREE.Mesh(
                            new THREE.SphereGeometry(that.parent ? that.scaledRadius : that.radius, 32, 32),
                            visualComponents.makeMaterial(
                                materialsType,
                                res[0],
                                res[1] ? res[1] : null,
                                res[2] ? res[2] : null,
                                res[0],
                                data.materialConfig
                            ));
                        that.threeObj.userData = {
                            type: 'planet',
                            name: data.name,
                            clickable: true,
                            clickAction: 'zoom',
                            blockMaterialUpdate: data.materialConfig?.blockMaterialUpdate
                        }
                        that.threeObj.name = data.name;

                        if (planetVector) {
                            that.planetVector = planetVector;
                            that.threeObj.position.set(
                                planetVector.x * Constants.planetsDistanceScale,
                                planetVector.y * Constants.planetsDistanceScale,
                                planetVector.z * Constants.planetsDistanceScale
                            );
                        } else {
                            that.threeObj.position.x = that.distance;
                            that.threeObj.position.y = 0;
                            that.threeObj.position.z = data.name === "Sun" ? 0 : that.distance;
                        }

                        that.initialPosition = that.threeObj.position.clone();
                        that.orbitalInclination = data.orbitalInclination;
                        that.threeDistanceFromParent = that.createThreeDistanceFromParent(data);
                        // this.orbitCentroid = this.createOrbitCentroid(data);
                        // if (parent) {
                        //     this.orbit = new Orbit(this, data.orbitColor);
                        // }

                        that.threeObj.geometry.computeBoundingSphere();
                        that.planetSphere = new THREE.Sphere(
                            that.threeObj.position,
                            that.threeObj.geometry.boundingSphere.radius);
                        // this.helpBox = new THREE.BoxHelper(this.threeObj, 0xffff00);

                        if (that.data.rotationPeriod) {
                            let period = that.data.rotationPeriod * 60 * 60;
                            that.rotationSpeed = Math.PI * 2 / period;
                        }

                        if (data.rings && !data.rings.hide) {
                            const geometry = new THREE.RingGeometry(
                                data.rings.innerRadius * Constants.planetsDecrementRadius * Constants.planetsRadiusScale,
                                data.rings.outerRadius * Constants.planetsDecrementRadius * Constants.planetsRadiusScale,
                                64);
                            const material = visualComponents.makeMaterial(materialsType, res[3]);
                            material.side = THREE.DoubleSide;
                            that.rings = new THREE.Mesh(geometry, material);
                            that.rings.position.copy(that.initialPosition);
                            that.rings.rotateX(THREE.MathUtils.degToRad(90));
                        }

                        resolve(that);
                    }, function (e) {
                        console.error(e);
                    }
                )
        })
    }

    createThreeDiameter(planetPrams) {
        return planetPrams.diameter * Constants.CELESTIAL_SCALE;
    }

    createThreeRadius(planetPrams) {
        // return (planetPrams.diameter * Constants.CELESTIAL_SCALE) / 2;
        // return planetPrams.radius * Constants.planetsRadiusScale;
        return planetPrams.radius * Constants.planetsDecrementRadius; // initial radius
    }

    createThreeDistanceFromParent(planetPrams) {
        return planetPrams.distanceFromParent * Constants.ORBIT_SCALE;
    }

    createOrbitCentroid() {
        return new THREE.Object3D();
    }

    addToScene(scene) {
        scene.add(this.threeObj);
        if (this.orbit) {
            scene.add(this.orbit._orbit);
        }
        if (this.helpBox) {
            scene.add(this.helpBox);
        }
        if (this.textMesh) {
            scene.add(this.textMesh);
        }
        if (this.rings) {
            scene.add(this.rings);
        }
    }

    updatePlanet(envParams) {
        // this.distance = (this.parent.radius * Constants.planetsRadiusScale) + (this.data.distanceFromParent * 0.00001 * Constants.planetsDistanceScale);
        if (this.planetVector) {
            // if (this.parent) {
            //     this.threeObj.scale.copy(new THREE.Vector3(Constants.planetsRadiusScale, Constants.planetsRadiusScale, Constants.planetsRadiusScale));
            // }
            this.threeObj.position.set(
                this.planetVector.x * Constants.planetsDistanceScale,
                this.planetVector.y * Constants.planetsDistanceScale,
                this.planetVector.z * Constants.planetsDistanceScale
            );
        } else {
            if (this.parent) {
                this.distance = this.parent.radius + (this.data.distanceFromParent * 0.00001 * Constants.planetsDistanceScale)
                this.threeObj.position.x = this.distance;
            }
        }

        this.threeObj.material.wireframe = envParams.materialsWireframe;
    }

    setDistanceFromParent(planetsRadiusScale) {
        // this.threeObj.scale.copy(new THREE.Vector3(planetsRadiusScale, planetsRadiusScale, planetsRadiusScale));
    }

    update(pos) {
        if (pos) {
            this.threeObj.position.copy(pos);
        }
        if (this.rotationSpeed) {
            this.threeObj.rotateY(this.rotationSpeed * Constants.planetsRotationSpeed);
        }
        // this.label.update();
    }
}

export default Planet;