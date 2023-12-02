import serverUtils from "../utils/serverUtils";

const sessionController = {

    sessions: [],

    generateSession() {
        let code = serverUtils.generateHashCode();
        this.sessions.push({
            code: code,
            valid: true,
            // expireDate: new Date()
        })
        return code;
    },

    validateSession(code) {
        let isValid = false;
        for (let i in this.sessions) {
            if (this.sessions[i].code === code && this.sessions[i].valid) {
                isValid = true;
                break;
            }
        }
        return isValid;
    }
}

export default sessionController;