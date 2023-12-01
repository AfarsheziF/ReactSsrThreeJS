//Yolife cloud dev version 13.09.20

const logger = require('./logger');

var limit = 100;
const mongoose = require('mongoose');
// import mongoose from "mongoose";
var db, Parse;

var objects = {

    init() {
        Parse = require("parse/node");
        objects.initDB();
    },

    getClassObjects(className, sortBy) {
        return new Promise((resolve, reject) => {
            logger.log('Get class objects: ' + className);
            // Parse.Cloud.useMasterKey();
            var classCount = 0, counter = 0, totalResults = [];
            var query = new Parse.Query(className);
            query.count().then(
                function (count) {
                    logger.log('Total objects count: ' + count);
                    classCount = count;
                    makeQuery();
                }, function (e) {
                    onError(e);
                }
            )

            function makeQuery() {
                logger.log('Getting objects: ' + totalResults.length + ' / ' + classCount);
                query.limit(limit);
                query.skip(counter)
                query.ascending(sortBy ? sortBy : "createdAt");
                query.find({ useMasterKey: true }).then(
                    function (results) {
                        totalResults = totalResults.concat(results);
                        counter = totalResults.length;
                        if (counter < classCount) {
                            makeQuery();
                        } else {
                            onResolve();
                        }
                    },
                    function (e) {
                        onError(e);
                    }
                );
            }

            function onError(e) {
                reject(e);
            }

            function onResolve() {
                resolve(totalResults);
            }
        })
    },

    deleteObj(className, id) {
        return new Promise((resolve, reject) => {
            // Parse.Cloud.useMasterKey();
            objects.getThisObj(className, id).then(
                function (obj) {
                    obj.destroy({ useMasterKey: true }).then(
                        function () {
                            resolve();
                        }, function (e) {
                            reject(e);
                        }
                    )
                }, function (e) {
                    reject(e);
                }
            )
        })

    },

    compareObjects(objects, subValue, subMetric, metric, objToCompare, operator) {
        return new Promise((resolve, reject) => {
            var result = {
                filteredObjects: [],
                skipped: []
            }, count = 0;

            compareThisObj(objects[0]);

            function compareThisObj(obj) {
                // notify('Compare obj => ' + count);
                if (obj[metric]) {
                    objects.getThisObj(obj[metric].className, obj[metric].id || obj[metric].objectId).then(
                        function (fetchedObj) {
                            var objSubValue = fetchedObj.get(subMetric)[subValue];

                            switch (operator.attr) {
                                case "size": compareBySize(objSubValue, obj);
                                    break;
                                default: compareByAttr(objSubValue, obj);
                            }

                            count++;
                            if (count < objects.length) {
                                compareThisObj(objects[count]);
                            } else {
                                resolve(result);
                            }
                        }, function (e) {
                            reject(e);
                        }
                    )
                } else {
                    // notify('Skipped obj => ' + count);
                    result.skipped.push(obj);
                    count++;
                    if (count < objects.length) {
                        compareThisObj(objects[count]);
                    } else {
                        resolve(result);
                    }
                }
            }

            function compareBySize(objSubValue, obj) {
                switch (operator.operator) {
                    case "small":
                        if (objSubValue.length < objToCompare.length) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "small_equal":
                        if (objSubValue.length <= objToCompare.length) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "equal":
                        if (objSubValue.length === objToCompare.length) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "equal_big":
                        if (objSubValue.length >= objToCompare.length) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "big":
                        if (objSubValue.length < objToCompare.length) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                }
            }

            function compareByAttr(objSubValue, obj) {
                switch (operator.operator) {
                    case "small":
                        if (objSubValue[operator.attr] < objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "small_equal":
                        if (objSubValue[operator.attr] <= objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "equal":
                        if (objSubValue[operator.attr] === objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "not_equal":
                        if (objSubValue[operator.attr] !== objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "equal_big":
                        if (objSubValue[operator.attr] >= objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                    case "big":
                        if (objSubValue[operator.attr] < objToCompare[operator.attr]) {
                            result.filteredObjects.push(obj)
                            // notify('Adding obj to results => ' + count);
                        }
                        break;
                }
            }
        });
    },

    getThisObj(className, id) {
        return new Promise(function (resolve, reject) {
            //console.log('getThisObj', className, id);
            // Parse.Cloud.useMasterKey();
            var query = new Parse.Query(className);
            query.equalTo("objectId", id);
            query.find({ useMasterKey: true }).then(
                function (results) {
                    if (results.length > 0) {
                        resolve(results[0]);
                    } else {
                        reject({ error: "Object was not found: " + className + " -> " + id });
                    }
                },
                function (error) {
                    reject(error);
                }
            );
        });
    },

    getThisObjBy(className, metric, input) {
        return new Promise(function (resolve, reject) {
            //console.log('getThisObj', className, id);
            // Parse.Cloud.useMasterKey();
            var query = new Parse.Query(className);
            query.equalTo(metric, input);
            query.find({ useMasterKey: true }).then(
                function (results) {
                    if (results.length > 0) {
                        resolve(results[0]);
                    } else {
                        reject({ error: "Object was not found" });
                    }
                },
                function (error) {
                    reject(error);
                }
            );
        });
    },

    getThisObjsBy(className, metric, input) {
        return new Promise(function (resolve, reject) {
            //logger.log('getThisObj', className, id);
            // Parse.Cloud.useMasterKey();
            var query = new Parse.Query(className);
            query.count().then(
                function (count) {
                    var query = new Parse.Query(className);
                    query.limit(count);
                    query.equalTo(metric, input);
                    query.find({ useMasterKey: true }).then(
                        function (results) {
                            resolve(results);
                        },
                        function (error) {
                            reject(error);
                        }
                    );
                }, function (e) {
                    reject(e);
                }
            );
        });
    },

    getAllObjs(className, metric, objsArray) {
        return new Promise((resolve, reject) => {
            logger.log("Getting list objects: " + className);
            // Parse.Cloud.useMasterKey();

            var counter = 0, totalResults = [], totalCount = objsArray.length;
            var query = new Parse.Query(className);

            makeQuery();

            function makeQuery() {
                logger.log('Getting objects: ' + className + ' ' + totalResults.length + ' / ' + totalCount);
                var slicedArray = objsArray.splice(0, limit);
                query.limit(limit);
                query.containedIn(metric, slicedArray).ascending('createdAt');
                query.find({ useMasterKey: true }).then(
                    function (results) {
                        totalResults = totalResults.concat(results);
                        counter = totalResults.length;
                        if (counter < totalCount && objsArray.length > 0) {
                            makeQuery();
                        } else {
                            onResolve();
                        }
                    },
                    function (e) {
                        onError(e);
                    }
                )
            }

            function onError(e) {
                reject(e);
            }

            function onResolve() {
                resolve(totalResults);
            }
        });
    },

    getPointerObjs(className, metric, pointerClass, objectId) {
        return new Promise((resolve, reject) => {
            // Parse.Cloud.useMasterKey();
            var query = new Parse.Query(className);
            query.count({ useMasterKey: true }).then(
                function (count) {
                    var query2 = new Parse.Query(className);
                    query2.limit(count);
                    query2.equalTo(metric, { "__type": "Pointer", "className": pointerClass, "objectId": objectId });
                    query2.find({ useMasterKey: true }).then(
                        function (results) {
                            resolve(results);
                        })
                        .catch(function (error) {
                            reject(error);
                        });
                }, function (e) {
                    reject(e);
                }
            );
        })
    },

    //MongoDB

    initDB(online) {
        return new Promise((resolve, reject) => {
            var url = "mongodb://user85e8fa:65b172Z_vaIUw2f7deb@cluster-pgrs3-0-eu-west-1-scalabledbs.cloudstrap.io:27003,cluster-pgrs3-1-eu-west-1-scalabledbs.cloudstrap.io:27003,cluster-pgrs3-2-eu-west-1-scalabledbs.cloudstrap.io:27003/pg-app-1-eu-1cltxnshjksg0clafdwxiw4ark8dvr?replicaSet=pgrs3&ssl=true";
            mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
            var connection = mongoose.connection;
            connection.on('error', function (e) {
                reject(e);
            });
            connection.once('open', function () {
                db = connection.db;
                logger.log('MongoDB Connection succeeded')
                resolve();
            })
        });
    },

    getDBCollection(className, sort) {
        return new Promise((resolve, reject) => {
            logger.log('Getting DB Collection: ' + className);
            if (!db) {
                objects.initDB().then(
                    function () {
                        getData();
                    }, function (e) {
                        reject(e);
                    }
                )
            } else {
                getData();
            }

            function getData() {
                db.collection(className, function (err, collection) {
                    if (err) {
                        reject(err);
                    } else {
                        collection.find({}).sort({ [sort]: -1 }).toArray(function (err, data) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(objects.formatData(className, data));
                            }
                        })
                    }
                });
            }
        })
    },

    formatData(className, data) {
        logger.log('Formatting DB Collection: ' + data.length);
        for (var i in data) {
            var obj = objects.formatDocument(data[i], className);
            data[i] = obj;
        }

        return data;
    },

    formatDocument(doc, className, writeable) {

        function Obj(doc) {
            // console.log(doc);
            var keys = Object.keys(doc);
            this.className = className;
            this.id = doc._id;
            this.createdAt = new Date(doc._created_at);
            this.updatedAt = new Date(doc._updated_at);
            for (var i in keys) {
                this[keys[i]] = doc[keys[i]];
                if (doc[keys[i]] && keys[i].indexOf && keys[i].indexOf("_p_") >= 0) {
                    var attr = keys[i].substring(keys[i].indexOf("_p_") + 3, keys[i].length);
                    var id = doc[keys[i]];
                    id = id.substring(id.indexOf("$") + 1, id.length);
                    this[attr] = {
                        id: id
                    }
                }
            }
        }

        if (writeable) {

            Obj.prototype.newState = {};

            Obj.prototype.get = function (key) {
                if (this[key] === undefined || this[key] === null) {
                    return false;
                } else {
                    return this[key];
                }
            }

            Obj.prototype.set = function (key, value) {
                this.__proto__.newState[key] = value;
            }

            Obj.prototype.save = function () {
                const that = this;
                return new Promise((resolve, reject) => {
                    db.collection(that.className, function (err, collection) {
                        if (err) {
                            reject(err);
                        } else {
                            collection.findOneAndUpdate({ _id: that.id }, { $set: that.__proto__.newState }, { new: true }, function (err, res) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(objects.formatDocument(res.value));
                                }
                            })
                        }
                    });
                })
            }
        }

        return new Obj(doc);
    }
}

module.exports = objects;