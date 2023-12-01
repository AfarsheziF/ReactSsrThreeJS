import envParams from "./envParams.json";
import settings from "./settings.json";
import texts from "./texts.json";

import envParams_backup from "./envParams backup.json";
import settings_backup from "./settings_backup.json";
import texts_backup from "./texts_backup.json";

export default {
    data: {
        envParams: envParams,
        settings: settings,
        texts: texts
    },
    backups: {
        envParams_backup: envParams_backup,
        settings_backup: settings_backup,
        texts_backup: texts_backup
    }
}