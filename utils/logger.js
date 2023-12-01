//Yolife cloud dev version 13.09.20

// const fs = require("fs");
const moment = require("moment");
// const emailController = require("./emailController");

var today = new Date();
var fileName = "DakiniAgency-" + today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear();

var os = require("os");
global.machineName = os.hostname();

// if (global.machineName === 'shimaon') {
//     // global.serverState = "dev";
// } else {
//     global.serverState = "production";
// }

global.serverState = "dev";

const logger = {

    logObj: null,
    sendErrorEmails: global.serverState !== 'dev',

    init: function () {
        console.info('Logger init: ' + fileName);
        var that = this;
        var query = new Parse.Query("Log");
        query.matches("name", fileName);
        query.first().then(
            function (obj) {
                if (obj) {
                    that.logObj = obj;
                    console.log('Logger: Log obj found');
                    console.info('Logger: Log obj found');
                } else {
                    that.createLogObj();
                }
            }, function (e) {
                console.error(e);
            }
        )
    },

    createLogObj: function () {
        var that = this;
        var logObj = new Parse.Object("Log");
        logObj.set('name', fileName);
        logObj.set('log', []);
        logObj.save().then(
            function (savedObj) {
                that.logObj = savedObj;
                console.log('Logger: Log obj found');
                console.info('Logger: New Log obj saved');
            }, function (e) {
                console.error(e);

            }
        );
    },

    log: function (line) {
        var date = new Date();
        date = moment(date).format('HH:mm:ss');
        console.log(date, line);
    },

    info: function (line) {
        if (global.serverState === "production") {
            console.info(line)
        };
        var date = new Date();
        console.log(moment(date).format('HH:mm:ss') + " " + line);
    },

    error: function (error, user) {
        var date = new Date();
        console.error(moment(date).format('HH:mm:ss') + " " + (error.message || error.e) + ". User: " + (user ? user.id : ''));
        console.trace("On cloud error");
        var err = new Error();

        if (this.sendErrorEmails) {
            this.sendLogEmail(error, user, err.stack);
        }
    },

    sendLogEmail: function (error, user, stack) {
        var receiver = "teamyolife@gmail.com",
            emailTitle = "New error log in yolife could",
            subject = "[ Yolife cloud error log ]";
        subject += " [ " + global.serverState + " ] ";
        subject += error.message || error.e

        var message = "";
        if (user) {
            message = "User: " + user.id + " / " + user.get('name') + " " + user.get('lastName') + " / " + user.get('email');
        }
        message +=
            "<br/><br/> Router Function: " + error.routerFunction +
            "<br/> API Function: " + error.apiFunction +
            // "<br/> Params: " + error.params ? error.params.toString() : "" +
            "<br/> App Version: " + error.appVersion +
            "<br/><br/> Error: " + error.message || error.e;

        if (stack) {
            message += "<br/><br/>" + stack
        }

        // emailController.sendEmail(receiver, emailTitle, subject, message).then(
        //     function (res) {
        //         console.log(res);
        //     }, function (e) {
        //         console.error(e);
        //     }
        // )
    }
}

module.exports = logger;