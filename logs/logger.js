//ReactSsrThreeJs version. 2.12.23

import fs from 'fs';
import moment from 'moment';

import emailController from "../utils/emailController";
import serverUtils from '../utils/serverUtils';

const logger = {

    fileName: null,
    currentLog: null,
    logsName: null,
    logsReceiver: null,
    emailIdentifier: null,
    sendErrorEmails: false,
    socketClients: [],
    io: null,
    dirname: null,

    init(logsName, logsReceiver, emailIdentifier, hostState) {
        const that = this;
        this.dirname = global.rootDir + '/logs/' + global.hostState + '/';
        return new Promise((resolve, reject) => {
            logger.logsName = logsName;
            logger.logsReceiver = logsReceiver;
            logger.emailIdentifier = `[ ${emailIdentifier} ] [ ${hostState} ]`;
            logger.sendErrorEmails = process.env.sendErrorEmails === 'true' || hostState === 'production';

            if (global.scheduleAnalytics) {
                global.scheduleAnalytics.errors.logErrors = [];
            }

            const today = new Date();
            logger.fileName = logger.logsName + "_" + today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear() + "_" + `${today.getHours()}-${today.getMinutes()}`;
            console.log(`Logger init: ${logger.fileName}. Dirname: ${that.dirname}`);

            initLogFile();

            function initLogFile() {
                serverUtils.readFile("/logs/" + global.hostState + '/' + logger.fileName + ".json").then(
                    logFile => {
                        console.log("Log file found. parsing data");
                        if (logFile.byteLength > 0) {
                            try {
                                logFile = JSON.parse(logFile);
                                logFile.logs.push({ type: "init", date: new Date().toString(), log: "Logger init" });
                                console.log("Log file parsed. saving current file");
                                saveNewLogFile(logFile);
                            }
                            catch (e2) {
                                let newLog = { date: new Date(), logs: [] };
                                newLog.logs.push({ type: "init", date: new Date().toString(), log: "Logger init" });
                                console.log("Log file read error. Creating new");
                                saveNewLogFile(newLog);
                            }
                        } else {
                            console.log("Log file found invalid. Creating new");
                            let newLog = { date: new Date(), logs: [] };
                            newLog.logs.push({ type: "init", date: new Date().toString(), log: "Logger init" });
                            saveNewLogFile(newLog);
                        }
                    },
                    e => {
                        console.log("Log file was not found. Creating new file");
                        let newLog = { date: new Date(), logs: [] };
                        newLog.logs.push({ type: "init", date: new Date().toString(), log: "Logger init" });
                        saveNewLogFile(newLog);
                    }
                );
            }

            function saveNewLogFile(logFile) {
                logger.saveToLogFile(logFile).then(
                    function () {
                        console.log('Sending error emails:', logger.sendErrorEmails);
                        resolve();
                    }, function (e) {
                        reject(e);
                    }
                )
            }

        });
    },

    log(line, type) {
        let date = new Date();
        date = moment(date).format('HH:mm:ss');
        console.log(date, line);
        const logObj = { type: type ? type : "log", date: new Date(), log: line };
        if (logger.currentLog && logger.currentLog.logs) logger.currentLog.logs.push(logObj);
        logger.saveToLogFile(logger.currentLog);

        for (let i in logger.socketClients) {
            logger.io.to(logger.socketClients[i]).emit('log', logObj);
        }
    },

    info(line) {
        console.info(line);
        const date = new Date();
        console.log(moment(date).format('HH:mm:ss') + " " + line);
    },

    error(e, obj) {
        if (e == null) {
            e = {}
        }
        let date = new Date();
        let message;

        console.error(moment(date).format('HH:mm:ss') + " " + (e.message || e));
        if (logger.currentLog && logger.currentLog.logs) logger.currentLog.logs.push({ type: "error", date: new Date().toString(), log: e });
        logger.saveToLogFile(logger.currentLog);
        if (global.scheduleAnalytics &&
            global.scheduleAnalytics.errors &&
            global.scheduleAnalytics.errors.logErrors) {
            global.scheduleAnalytics.errors.logErrors.push({
                name: 'Log error',
                createdAt: new Date().toString(),
                message: e.message || e,
                object: obj,
                stack: new Error().stack
            });
        }
        if (typeof obj === 'object') {
            obj = JSON.stringify(obj);
        }
        if (typeof e === 'object') {
            message = JSON.stringify(e.message);
            e = message + "<br/><br/>" + JSON.stringify(e.stack);
        }
        if (this.sendErrorEmails) {
            this.sendLogEmail(e, message, obj);
        }
        for (let i in logger.socketClients) {
            logger.io.to(logger.socketClients[i]).emit('errorLog', e);
        }
    },

    saveToLogFile(_log) {
        const that = this;
        return new Promise((resolve, reject) => {
            if (!global.__DEV__) {
                this.currentLog = _log;
                let data = JSON.stringify(this.currentLog);
                let filePath = that.dirname + "/" + this.fileName + ".json";
                if (!data) {
                    data = "log file was invalid"
                }
                // console.log('Saving log file: ' + filePath);
                if (fs && fs.watchFile) {
                    fs.writeFile(filePath, data,
                        function (e) {
                            if (e) {
                                console.error(e);
                                reject(e);
                            }
                            resolve();
                        });
                }
            } else {
                resolve();
            }
        })
    },

    getTodayLog() {
        const that = this;
        return new Promise((resolve, reject) => {
            fs.readFile(that.dirname + "/" + that.fileName + ".json", (e, log) => {
                if (e) {
                    reject(e);
                } else {
                    resolve(log);
                }
            })
        })
    },

    sendLogEmail(message, shortTitle, parseObj) {
        const emailTitle = "New error log",
            subject = emailTitle + " " + this.emailIdentifier + " " + shortTitle;

        if (parseObj && parseObj.id) {
            message = "Error: " + message + "<br/><br/>" +
                "ObjectId: " + parseObj.id + " / " + parseObj.get('name') + " " + parseObj.get('lastName') + " / " + parseObj.get('email');
        }

        emailController.sendEmail(this.logsReceiver, emailTitle, subject, message).then(
            function (res) {
                console.log(res);
            }, function (e) {
                console.error(e);
            }
        )
    },

    sendDataTo(dest, data) {
        for (let i in this.socketClients) {
            this.io.to(this.socketClients[i]).emit(dest, data);
        }
    }
}

export default logger;
