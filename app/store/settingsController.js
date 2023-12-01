import utils from '../utils/utils';

const settingsController = {

    processInputs(settings) {
        let inputs = {};
        for (let i in settings.inputs) {
            if (utils.isMobile) {
                if (settings.inputs[i].disabled_mobile != null) {
                    settings.inputs[i].disabled = settings.inputs[i].disabled_mobile;
                }
                if (settings.inputs[i].value_mobile != null) {
                    settings.inputs[i].value = settings.inputs[i].value_mobile;
                    for (let k in settings.inputs[i].values) {
                        if (settings.inputs[i].values[k].value_mobile != null) {
                            settings.inputs[i].values[k].value = settings.inputs[i].values[k].value_mobile;
                        }
                    }
                }
            }
            inputs[settings.inputs[i].name] = settings.inputs[i].value
        }
        return inputs;
    }

}

export default settingsController;