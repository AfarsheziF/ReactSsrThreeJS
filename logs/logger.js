//Queue version 23.11.21. Logger in logs dir

import fs from 'fs';
import moment from 'moment';

import emailController from "../utils/emailController";

const logger = {

    fileName: null,
    currentLog: null,
    logsName: null,
    logsReceiver: null,
    emailIdentifier: null,
    sendErrorEmails: false,
    socketClients: [],
    io: null,
    dirname: __dirname,

    init(logsName, logsReceiver, emailIdentifier, hostState) {
        return new Promise((resolve, reject) => {
            logger.logsName = logsName;
            logger.logsReceiver = logsReceiver;
            logger.emailIdentifier = `[ ${emailIdentifier} ] [ ${hostState} ]`;
            logger.sendErrorEmails = process.env.sendErrorEmails === 'true' || hostState === 'production';
            if (global.scheduleAnalytics) {
                global.scheduleAnalytics.errors.logErrors = [];
            }
            var today = new Date();
            logger.fileName = logger.logsName + "_" + today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear() + "_" + `${today.getHours()}-${today.getMinutes()}`;
            console.log(`Logger init: ${logger.fileName}. Dirname: ${this.dirname}`);

            if (this.dirname.indexOf('/logs') < 0) {
                this.dirname = global.rootDir + '/logs/'
            }

            fs.readFile(this.dirname + "/" + global.hostState + "/" + logger.fileName + ".json", (e, logFile) => {
                if (e) {
                    console.log("Log file was not found. Creating new file");
                    let newLog = { date: new Date(), logs: [] };
                    newLog.logs.push({ type: "init", date: new Date(), log: "Logger init" });
                    saveNewLogFile(newLog);
                } else {
                    console.log("Log file found. parsing data");
                    if (logFile.byteLength > 0) {
                        try {
                            logFile = JSON.parse(logFile);
                            logFile.logs.push({ type: "init", date: new Date(), log: "Logger init" });
                            console.log("Log file parsed. saving current file");
                            saveNewLogFile(logFile);
                        }
                        catch (e2) {
                            let newLog = { date: new Date(), logs: [] };
                            newLog.logs.push({ type: "init", date: new Date(), log: "Logger init" });
                            console.log("Log file read error. Creating new");
                            saveNewLogFile(newLog);
                        }
                    } else {
                        console.log("Log file found invalid. Creating new");
                        let newLog = { date: new Date(), logs: [] };
                        newLog.logs.push({ type: "init", date: new Date(), log: "Logger init" });
                        saveNewLogFile(newLog);
                    }
                }
            });

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
        var date = new Date();
        date = moment(date).format('HH:mm:ss');
        console.log(date, line);
        var logObj = { type: type ? type : "log", date: new Date(), log: line };
        if (logger.currentLog && logger.currentLog.logs) logger.currentLog.logs.push(logObj);
        logger.saveToLogFile(logger.currentLog);

        for (var i in logger.socketClients) {
            logger.io.to(logger.socketClients[i]).emit('log', logObj);
        }
    },

    info(line) {
        console.info(line);
        var date = new Date();
        console.log(moment(date).format('HH:mm:ss') + " " + line);
    },

    error(e, obj) {
        if (e == null) {
            e = {}
        }
        let date = new Date();
        let message;

        console.error(moment(date).format('HH:mm:ss') + " " + (e.message || e));
        if (logger.currentLog && logger.currentLog.logs) logger.currentLog.logs.push({ type: "error", date: new Date(), log: e });
        logger.saveToLogFile(logger.currentLog);
        if (global.scheduleAnalytics &&
            global.scheduleAnalytics.errors &&
            global.scheduleAnalytics.errors.logErrors) {
            global.scheduleAnalytics.errors.logErrors.push({
                name: 'Log error',
                createdAt: new Date(),
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
        for (var i in logger.socketClients) {
            logger.io.to(logger.socketClients[i]).emit('errorLog', e);
        }
    },

    saveToLogFile(_log) {
        return new Promise((resolve, reject) => {
            logger.currentLog = _log;
            let data = JSON.stringify(logger.currentLog);
            let filePath = this.dirname + "/" + global.hostState + "/" + logger.fileName + ".json";
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
        })
    },

    getTodayLog() {
        return new Promise((resolve, reject) => {
            fs.readFile(logger.dirname + "/" + global.hostState + "/" + logger.fileName + ".json", (e, log) => {
                if (e) {
                    reject(e);
                } else {
                    resolve(log);
                }
            })
        })
    },

    sendLogEmail(message, shortTitle, parseObj) {
        var emailTitle = "New error log",
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
        var that = this;
        for (var i in that.socketClients) {
            that.io.to(that.socketClients[i]).emit(dest, data);
        }
    }
}

export default logger;
