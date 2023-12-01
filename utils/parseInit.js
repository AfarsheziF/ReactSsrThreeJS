const Parse = require("parse/node");
const objects = require('./objects');

const parseInit = {
    init() {
        //Joliba
        Parse.initialize(
            "mePlZcG5fODbUvj19DGboB5iHCP7BVVOTz5C3R9z",
            "x32xV13HUSCJCS9kkt6uTm1zQPVn8RCVO9fzB5a7"
        );
        Parse.serverURL = 'https://pg-app-1cltxnshjksg0clafdwxiw4ark8dvr.scalabl.cloud/1/';
        objects.init();
    }
}

export default parseInit;