import * as THREE from "vendor_mods/three/build/three.module";

import { VisualUtils } from "./VisualComponents";
import appUtils from "../../../utils/appUtils";


class VisualAnimations {

    onDebug;
    envParams;
    visualComponents;
    frameAnimations;
    listeners;
    state;

    init({ visualComponents, envParams, state }) {
        this.visualComponents = visualComponents;
        this.onDebug = visualComponents.onDebug;
        this.envParams = envParams;
        this.state = state;

        this.frameAnimations = {
            camera: {
                autoRotate: {
                    active: false,
                    speed: 0.05,
                    radius: 500,
                    value: 0,
                    target: new THREE.Vector3(),
                    update: ({ time }) => {
                        VisualUtils.orbitAroundVector(
                            this.visualComponents.camera,
                            this.frameAnimations.camera.autoRotate.target,
                            this.frameAnimations.camera.autoRotate.radius,
                            time,
                            this.frameAnimations.camera.autoRotate.speed,
                            true
                        );
                    }
                }
            }
        };

        this.listeners = {
            listeners: {
                camera: {
                    update: ({ listener, time }) => {
                        const source = this.visualComponents.camera;
                        for (const componentKey in listener.listeners) {
                            const componentListener = listener.listeners[componentKey];
                            let component = this.visualComponents[componentKey] || this.visualComponents.components[componentKey];
                            if (component) {
                                for (const key in componentListener) {
                                    const sourceValue = appUtils.reduceArrayToValue(componentListener[key].source_value, source);
                                    if (this.onDebug && this.envParams.debug) {
                                        document.getElementById("listener_camera").innerHTML = `[ Camera ] ${componentKey} ${key} => ${sourceValue}`;
                                    }
                                    let value;
                                    switch (componentListener[key].condition.key) {
                                        case "smaller_then":
                                            value = sourceValue < componentListener[key].condition.value;
                                            break;
                                        case "bigger_then":
                                            value = sourceValue > componentListener[key].condition.value;
                                            break;
                                    }
                                    switch (componentListener[key].key) {
                                        case "set_visible":
                                            appUtils.reduceArrayToValue(componentListener[key].property, component).visible = value;
                                            break;
                                    }
                                }
                            } else {
                                // Was not found
                            }
                        }
                    }
                }
            }
        }

        if (this.onDebug) {
            let animations = ``;
            for (const groupKey in this.envParams.groups) {
                const group = this.envParams.groups[groupKey];
                animations += `<h4 id="${groupKey}">${groupKey.toUpperCase()}</h4>`;
                for (const key in group.animations) {
                    for (const animKey in group.animations[key]) {
                        animations += `<p id="anim_${key}_${animKey}">[ ${key} ] ${animKey}<p>`
                    }
                }
            }
            let listeners = '';
            for (const key in this.envParams.listeners) {
                listeners += `<p id="listener_${key}">[ ${key} ]<p>`
            }

            this.helperElement = document.createElement('div');
            this.helperElement.id = "animationDebug";
            this.helperElement.style = `position: absolute; top: 0; left :0; padding: 15px; display:${envParams.debug ? 'block' : 'none'}`;
            this.helperElement.innerHTML = //html
                `
                <div id="animationsHelper">
                    <h3>Animations</h3>
                    ${animations}
                </div>
                <div id="listenersHelper" style="margin-top: 15px">
                    <h3>Listeners</h3>
                    ${listeners}
                </div>
                `;
            document.body.appendChild(this.helperElement);

            // Gui

            const getComponentControl = (controller, title) => {
                while (controller.parent && controller.parent._title.toLowerCase() !== title.toLowerCase()) {
                    if (controller.parent) {
                        controller = controller.parent;
                    } else {
                        break;
                    }
                }
                return controller;
            }

            for (const groupKey in envParams.groups) {
                envParams.groups[groupKey].run_all_function = 0;
                for (const key in envParams.groups[groupKey].animations) {
                    for (let animKey in envParams.groups[groupKey].animations[key]) {
                        envParams.groups[groupKey].animations[key][animKey].run_animation_function = 0;
                    }
                }
            }
            visualComponents.addGui('Animation', envParams).onChange(
                ({ controller, property, value }) => {
                    switch (property) {
                        case "debug":
                            document.getElementById('animationDebug').style.display = value ? 'block' : 'none';
                            break;

                        case "listeners":
                            //
                            break;

                        case "run_animation": {
                            const group = getComponentControl(controller, 'groups');
                            const parent = getComponentControl(controller, 'animations')
                            if (parent) {
                                this.runGroupAnimation({
                                    animation: this.envParams.groups[group._title].animations[parent._title][controller.parent._title],
                                    componentKey: parent._title,
                                    key: property,
                                    animKey: controller.parent._title
                                })
                            }
                        }
                            break;

                        case "run_all": {
                            const group = getComponentControl(controller, 'groups');
                            this.runGroupAnimation({
                                group: this.envParams.groups[group._title],
                                componentKey: parent._title,
                                key: property,
                                animKey: controller.parent._title
                            })
                        }
                            break;

                        default: {
                            console.log(`> VisualAnimations. RunAnimation -> component was not found ${parent._title}`);
                        }
                            break;
                    }
                });
        }
    }

    runGroupAnimation({ group, animation, componentKey, key, animKey }) {
        switch (key.toLowerCase()) {
            case "run_all":
                for (const componentKey in group.animations) {
                    const component = this.getComponent(componentKey);
                    if (component) {
                        for (const animKey in group.animations[componentKey]) {
                            this.startAnimation(
                                component,
                                group.animations[componentKey][animKey],
                                animKey,
                                componentKey
                            );
                        }
                    } else {
                        console.log(`> VisualAnimations. RunAnimation -> component was not found ${animKey}`);
                    }
                }
                break;

            case 'run_animation': {
                const component = this.getComponent(componentKey);
                if (component) {
                    this.startAnimation(
                        component,
                        animation,
                        animKey,
                        componentKey
                    );
                } else {
                    console.log(`> VisualAnimations. RunAnimation -> component was not found ${componentKey}`);
                }
            }
                break;
        }
    }

    runSceneAnimation(component, key, animKey, props) {
        const { animation, animValue } = props;

        const runAnimationKey = () => {
            switch (animation.key) {
                case "set_value":
                    component[animation.property] = animation.value * animValue;
                    break;
            }
        }

        switch (key.toLowerCase()) {
            case "camera":
                switch (animation.key) {
                    case "look_at":
                        component.lookAt(animValue);
                        break
                    case "set_position":
                        component.position.copy(animValue);
                        break;
                    case "auto_rotate":
                        this.frameAnimations.camera.autoRotate.active = animValue;
                        break;
                }
                break;

            case "controls": {
                switch (animation.key) {
                    case "set_value":
                        this.visualComponents[key][animation.value.property] = animation.value.value;
                        break;

                    case "auto_rotate":
                        switch (this.visualComponents.controls.constructor.name) {
                            case "FirstPersonControls":
                                // Camera should be used directly
                                break
                            case "OrbitControls":
                                this.visualComponents.controls[animation.value.property] = animation.value.value;
                                break;
                        }
                        break

                }
            }
                break;

            // Because im lazy
            case "spheremesh": {
                switch (animation.key) {
                    case "set_value":
                        this.visualComponents.components[key].envParams[animation.value.property] = animation.value.value;
                        break

                }
            }
                break;

            default:
                // if (this.envParams.groupKey[key]) {

                //     console.log("!!!");
                // }
                if (component) {
                    runAnimationKey();
                } else {
                    console.log(`> VisualAnimations. runSceneAnimation: Key is not supported: ${key}`);
                }
                break;
        }
    }

    runStateAnimation(component, key, animKey, props) {
        switch (props.animation.key) {
            case "set_scene_state":
                this.state.setSceneState(props.animValue);
                break;
            case "set_holder_state":
                this.state.setHolderState(props.animValue);
                break;
        }
    }

    getComponent(key) {
        let component;
        if (key.toLowerCase() === 'state') {
            component = {};
        } else {
            component = this.visualComponents[key] || this.visualComponents.components[key];
            if (!component) {
                component = this.envParams.groups[key];
            }
        }
        return component;
    }

    //

    startAnimation(component, animation, animKey, key) {

        const runAnimationFunction = (animValue, animation) => {
            const props = { animValue, animation, key: animKey };
            if (component.runAnimation) {
                // VisualComponent
                component.runAnimation(props)
            } else {
                if (key.toLowerCase() === 'state') {
                    this.runStateAnimation(component, key, animKey, props);
                }
                else {
                    this.runSceneAnimation(component, key, animKey, props)
                }
            }
        }

        const performAnimation = (an, onComplete) => {
            new TWEEN.Tween(an.animation.from)
                .to(an.animation.to, an.animation.duration || 3000)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(({ value }) => {
                    runAnimationFunction(value, an)
                })
                .onComplete(({ value }) => {
                    if (an.animation.type) {
                        switch (an.animation.type.key) {
                            case "blink_animation":
                                if (an.animation.count == null) {
                                    an.animation.count = 0;
                                }
                                if (an.animation.count < an.animation.type.repetitions) {
                                    const repeatedAnimation = Object.assign({}, an);
                                    repeatedAnimation.animation.from.value = value;
                                    repeatedAnimation.animation.to.value = value === 0 ? 1 : 0;
                                    repeatedAnimation.animation.count++;
                                    performAnimation(repeatedAnimation);
                                }
                                break;

                            default:
                                if (onComplete) {
                                    onComplete();
                                }
                                break;
                        }
                    } else {
                        if (onComplete) {
                            onComplete();
                        }
                    }
                })
                .start();
        }

        const setAnimation = (an, anKey) => {
            if (an.value &&
                an.value.key &&
                typeof an.value === 'object') {
                switch (an.value.key.toLowerCase()) {
                    case "visual_component": {
                        an.value = appUtils.reduceArrayToValue(an.value.value, this.visualComponents);
                    }
                        break;

                    case "env_params":
                        an.value = appUtils.reduceArrayToValue(an.value.value, this.visualComponents.envParams);
                        break;
                }
            }
            console.log(`> VisualAnimations.Starting animation: ${key} -> ${animKey} `)
            if (an.animation) {
                an.animation && performAnimation(an);
            } else {
                runAnimationFunction(an.value, an)
            }
        }

        for (let anKey in animation) {
            switch (anKey.toLowerCase()) {
                case "run_animation_function":
                case "run_animation":
                case "condition":
                case "started":
                    // Skip
                    break;

                default:
                    animation.stared = true;
                    if (animation.condition?.delay) {
                        setTimeout(() => {
                            setAnimation(animation[anKey], anKey);
                        }, animation.condition.delay);
                    } else {
                        setAnimation(animation[anKey], anKey);
                    }
                    break;
            }
        }
    }

    processAnimationCondition(animation, key, animKey) {
        const component = this.getComponent(key);
        if (component) {
            if (this.onDebug && this.envParams.debug) {
                document.getElementById("anim_" + key + "_" + animKey).innerHTML = `[ ${key} ]: ${animKey} => Processing`;
            }

            let value = animation.condition.value;
            if (typeof animation.condition.value === 'object' && animation.condition.value.key) {
                // Get position from component
                switch (animation.condition.value.key) {
                    case "visual_component": {
                        value = appUtils.reduceArrayToValue(animation.condition.value.value, this.visualComponents);
                    }
                        break;

                    case "property": {
                        value = appUtils.reduceArrayToValue(animation.condition.value.value, component)
                    }
                        break;
                }
            }

            switch (animation.condition.key) {
                case "on_start":
                    // Run on scene start
                    if (this.onDebug && this.envParams.debug) {
                        document.getElementById("anim_" + key + "_" + animKey).innerHTML = `[ ${key} ] ${animKey} => On start [ TRUE ]`;
                    }
                    console.log(`> VisualAnimations.Starting conditioned animation: On Start ${key} -> ${animKey}`);
                    this.startAnimation(component, animation, animKey, key)
                    break;

                case "distance": {
                    // Evaluate by distance
                    let source = this.visualComponents.camera.position;
                    if (typeof animation.condition.source === 'object' && animation.condition.source.key) {
                        switch (animation.condition.source.key) {
                            case "visual_component": {
                                source = appUtils.reduceArrayToValue(animation.condition.source.value, this.visualComponents)
                            }
                                break;
                        }
                    }

                    const dis = Math.round(source.distanceTo(value));
                    if (this.onDebug && this.envParams.debug) {
                        document.getElementById("anim_" + key + "_" + animKey).innerHTML = `[ ${key} ] ${animKey} => [ Processing ] distance: ${dis} < ${animation.condition.distance}`;
                    }
                    if (dis !== 0 && dis < animation.condition.distance) {
                        if (this.onDebug && this.envParams.debug) {
                            document.getElementById("anim_" + key + "_" + animKey).innerHTML = `[ ${key} ] ${animKey} => [ TRUE ] distance: ${dis} < ${animation.condition.distance}`;
                        }
                        console.log(`> VisualAnimations.Starting conditioned animation: Distance ${key} -> ${animKey} ${dis} < ${animation.condition.distance}`);
                        this.startAnimation(component, animation, animKey, key)
                    }
                }
                    break;
            }
        } else {
            console.log(`> VisualAnimations. processAnimationCondition: Component was not found: ${key}`);
        }
    }

    processGroupAnimation(animationGroup) {
        for (const key in animationGroup.animations) {
            // if ((this.visualComponents[key] || this.visualComponents.components[key]) ||
            //     this.envParams.groups[key] ||
            //     key.toLowerCase() === 'state') {
            const animation = animationGroup.animations[key];
            for (const animKey in animation) {
                if (!animation[animKey].stared && animation[animKey].condition) {

                    if (animation[animKey].condition.after) {
                        let afterAnimation;
                        // Dotted notation to access out animation key
                        if (animation[animKey].condition.after.indexOf(',') > 0) {
                            afterAnimation = appUtils.reduceArrayToValue(animation[animKey].condition.after.split(','), animationGroup.animations);
                        } else {
                            afterAnimation = animation[animation[animKey].condition.after];
                        }
                        if (afterAnimation.stared) {
                            this.processAnimationCondition(animation[animKey], key, animKey);
                        }
                    } else {
                        this.processAnimationCondition(animation[animKey], key, animKey);
                    }
                }
                // }
            }
        }
    }

    //

    update({ time, deltaTime }) {
        TWEEN.update();

        if (this.visualComponents) {
            for (const groupKey in this.envParams.groups) {
                const animationGroup = this.envParams.groups[groupKey];
                if (this.onDebug && this.envParams.debug) {
                    document.getElementById(groupKey).innerHTML = `${groupKey.toUpperCase()} [ ${animationGroup.active ? 'ACTIVE' : 'INACTIVE'} ]`;
                }
                if (animationGroup.active) {
                    if (animationGroup.condition && !animationGroup.condition.started) {
                        switch (animationGroup.condition.source.key) {
                            case "visual_component":
                                if (appUtils.reduceArrayToValue(animationGroup.condition.source.value, this.visualComponents) === animationGroup.condition.value) {
                                    animationGroup.condition.stared = true;
                                    this.processGroupAnimation(animationGroup);
                                }
                                break;
                        }
                    } else {
                        this.processGroupAnimation(animationGroup);
                    }
                }
            }

            for (const key in this.frameAnimations) {
                for (const animKey in this.frameAnimations[key]) {
                    if (this.frameAnimations[key][animKey].active) {
                        this.frameAnimations[key][animKey].update({ time })
                    }
                }
            }

            for (const key in this.envParams.listeners) {
                if (this.envParams.listeners[key].active) {
                    this.listeners.listeners[key].update({ listener: this.envParams.listeners[key], time });
                }
            }
        }
    }

}

export default new VisualAnimations();