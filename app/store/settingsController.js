import appUtils from '../utils/appUtils';

// input attributes
// "text"
// "key"
// "type",
// "value"
// value_mobile
// "disabled_mobile"
// "closeDialogOnChange"
// "reloadDialog"
// "values"
// tier_visible
// $input_key in key

const settingsController = {

    processInputs(settings, envParams, reload) {
        const tierSettings = envParams.settings[global.settingsState];

        for (let i in settings.inputs) {

            if (settings.inputs[i].key === "settings_mode") {
                for (const key in settings.inputs[i].values) {
                    if (settings.inputs[i].values[key].disabled_mobile) {
                        settings.inputs[i].values[key].disabled = appUtils.isMobile;
                    }
                    if (settings.inputs[i].values[key].tier === global.settingsState) {
                        settings.inputs[i].value = settings.inputs[i].values[key].value;
                        break;
                    }
                }
            } else {
                let value = settings.inputs[i].value;
                if (appUtils.isMobile) {
                    if (settings.inputs[i].value_mobile) {
                        value = settings.inputs[i].value_mobile;
                    }
                    if (settings.inputs[i].disabled_mobile) {
                        settings.inputs[i].disabled = true
                    }
                }

                if (value == null || settings.inputs[i].reloadValue) {
                    const keys = Array.isArray(settings.inputs[i].key) ? settings.inputs[i].key : [settings.inputs[i].key];
                    if (keys.indexOf('$input_key') >= 0) {
                        // Dynamic evaluation.
                        const key = keys[keys.length - 1];
                        const input_keys = keys.slice(0, keys.indexOf('$input_key'));
                        const values = appUtils.reduceArrayToValue(input_keys, tierSettings);
                        for (let k in values) {
                            if (values[k][key]) {
                                keys[keys.indexOf('$input_key')] = k;
                                settings.inputs[i].text = settings.inputs[i].text.replace('$input_key', k);
                                break;
                            }
                        }
                    }
                    value = settings.inputs[i].value = appUtils.reduceArrayToValue(keys, tierSettings);
                }

                if (settings.inputs[i].tier_visible) {
                    settings.inputs[i].hide = settings.inputs[i].tier_visible.indexOf(global.settingsState) < 0;
                }
            }
        }
    }

}

export default settingsController;