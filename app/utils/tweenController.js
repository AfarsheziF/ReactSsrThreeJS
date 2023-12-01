// Tween injects from CDN

const tweenController = {

    makeTween(from, to, duration, easing, onUpdate, onComplete) {
        let tween = new TWEEN.Tween(from)
            .to(to, duration)
            .easing(easing ? easing : TWEEN.Easing.Elastic.Out)
            .onUpdate(function (value) {
                if (onUpdate) onUpdate(value);
            })
            .onComplete(function () {
                if (onComplete) onComplete();
            })
            .start();
    }

}

export default tweenController;