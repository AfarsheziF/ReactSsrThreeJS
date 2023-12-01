// Or Sarfati version. 01.22.22

import fs from 'fs';
import https from 'https';
import path from 'path';
import moment from 'moment-timezone';

import logger from '../logs/logger';

const utils = {

    addTimeZone: function (date) {
        //Add offset time of Berlin// 
        var zone = moment.tz.zone('Europe/Berlin');
        var offset = zone.utcOffset(date.valueOf());
        offset *= 60000;
        date.setTime(date.getTime() + offset);
        return date;
    },

    generateHashCode() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    },

    getHashCode(s) {
        s += "";
        return s.split("").reduce(function (a, b) {
            a = (a << 5) - a + b.charCodeAt(0);
            s = a & a;
            return s + "";
        }, 0);
    },

    getLastArrayValue(array, value) {
        if (array) {
            try {
                for (var i = array.length - 1; i >= 0; i--) {
                    var obj = array[i];
                    if (obj[value] !== null) {
                        return obj[value];
                    }
                }
            } catch (e) {
                console.error("GetLastArrayValue Bug! Value:", array, "=>", value);
                console.error(e);
                return null;
            }
        } else {
            console.error(
                "GetLastArrayValue Bug! Array is null, value:",
                array,
                "=>",
                value
            );
            return null;
        }
    },

    createDateAsUTC(date) {
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
    },

    convertDateToUTC(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    },

    insertArrayAt(array, index, arrayToInsert) {
        Array.prototype.splice.apply(array, [index, 0].concat(arrayToInsert));
        return array;
    },

    readFile(path, encoding) {
        return new Promise((resolve, reject) => {
            path = global.rootDir + path;
            try {
                fs.readFile(path, encoding ? encoding : 'utf8', function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        });
    },

    saveFile(fileName, path, file, encoding) {
        return new Promise((resolve, reject) => {
            let fs = require('fs');
            try {
                fs.writeFile(global.rootDir + path + fileName, file, encoding, function (err) {
                    if (err) {
                        reject(err)
                    } else {
                        logger.log('File saved: ' + fileName);
                        resolve();
                    }
                });
            }
            catch (e) {
                reject(e);
            }
        })
    },

    copyFile(sourceFile, desFile) {
        return new Promise((resolve, reject) => {
            const fs = require('fs');
            // File destination.txt will be created or overwritten by default.
            fs.copyFile(global.rootDir + sourceFile, global.rootDir + desFile,
                function (e) {
                    if (e) { reject(e) }
                    else { resolve() }
                });
        });
    },

    readDir(pathFromRoot) {
        return new Promise((resolve, reject) => {
            fs.readdir(global.rootDir + pathFromRoot, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files)
                }
            });
        })

    },

    emptyDir(pathFromRoot) {
        return new Promise((resolve, reject) => {
            logger.log('Emptying dir: ' + pathFromRoot);
            fs.readdir(global.rootDir + pathFromRoot, (err, files) => {
                if (err) reject(err);
                else {
                    if (files.length > 0) {
                        let errors = [], counter = 0;
                        for (const file of files) {
                            fs.unlink(path.join(global.rootDir + pathFromRoot, file), (err2) => {
                                counter++;
                                if (err2) errors.push(err2);
                                else logger.log(`File deleted: ${file}. ${counter} / ${files.length}`);
                                if (counter === files.length) {
                                    if (errors.length > 0) {
                                        reject({ errors: errors, message: 'Errors during unlink', directory: global.rootDir + pathFromRoot });
                                    } else {
                                        resolve();
                                    }
                                }
                            });
                        }
                    } else {
                        resolve();
                    }
                }
            });
        });
    },

    saveToJsonFile(fileName, path, obj) {
        return new Promise((resolve, reject) => {
            let json = JSON.stringify(obj);
            let fs = require('fs');
            fs.writeFile(path + fileName + ".json", json, 'utf8', function (err) {
                if (err) {
                    reject(err)
                } else {
                    logger.log('File saved: ' + fileName);
                    resolve();
                }
            });
        });
    },

    downloadToFile(uri, pathFromRoot, format, readEncoding, readBack) {
        return new Promise((resolve, reject) => {
            var filename_abs = global.rootDir + pathFromRoot + '.' + format;
            logger.log("Downloading to file: " + filename_abs);
            var file = fs.createWriteStream(filename_abs);
            https.get(uri,
                function (res) {
                    // console.log('content-type:', res.headers['content-type']);
                    // console.log('content-length:', res.headers['content-length']);
                    res.pipe(file);
                    file.on('finish', function () {
                        logger.log("File downloaded: " + filename_abs);
                        file.close(function () {
                            if (readBack) {
                                utils.readFile(pathFromRoot + '.' + format, readEncoding).then(
                                    function (_file) {
                                        resolve(_file);
                                    }, function (e) {
                                        logger.log('File read error');
                                        logger.error(e);
                                        resolve({ onError: true, 'message': 'saved but not loaded', error: e, fileName: pathFromRoot });
                                    }
                                )
                            } else {
                                resolve(filename_abs);
                            }
                        });
                    }).on('error', function (err) {
                        fs.unlink(filename_abs);
                        reject(err)
                    });
                })
        });
    },

    getId() {
        return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    isValidDate(_date) {
        var date = new Date(_date);
        return date != 'Invalid Date';
    },

    extractTagsFromString(string, tag) {
        return string.split(' ').filter(v => v.startsWith(tag))
    },

    toTitleCase(string) {
        return string.split(' ').map(w => w.substring(0, 1).toUpperCase() + w.substring(1)).join(' ')
    },

    splitStringToArray(string, splitter, removeEmpty) {
        let a = string.split(splitter);
        if (removeEmpty) {
            a = a.filter(function (el) {
                return el.trim() !== "";
            });
        }
        return a;
    },

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    isFunction(functionToCheck) {
        return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    }

}

export default utils;