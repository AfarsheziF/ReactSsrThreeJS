import md5 from 'md5';
import { getGPUTier } from 'detect-gpu';

const appUtils = {
    browserType: null,
    osType: null,
    isMobile: false,
    isLowEndMobile: false,
    gpu: null,

    toSimpleDataString(date) {
        console.log(date);
        return date.toISOString().slice(0, 10).replace(/-/g, "");
    },

    createId() {
        return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function (c) {
            var r = Math.random() * 16 | 0;
            return r.toString(16);
        });
    },

    hashString(string) {
        return md5(string);
    },

    randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getDateString(date) {
        var dateTitle = (date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear());
        return dateTitle;
    },

    capitalizeFirstLetter(string) {
        if (Array.isArray(string)) {
            for (let i in string) {
                string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1);
            }
            return string;
        } else {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    },

    openInNewTab(url) {
        var win = window.open(url, '_blank');
        win.focus();
    },

    downloadToJSON(data, fileName) {
        // create file in browser
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const href = URL.createObjectURL(blob);

        // create "a" HTLM element with href to file
        const link = document.createElement("a");
        link.href = href;
        link.download = fileName + ".json";
        document.body.appendChild(link);
        link.click();

        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    },

    browserCheck() {
        if (typeof window !== 'undefined') {
            this.isMobile = window.mobilecheck();
            this.browserType = this.getBrowser();
            this.os = this.getOS();
            this.osType = this.os.type;
            window.isMobile = this.isMobile;
            window.browserType = this.browserType;
            window.os = this.os;
            window.osType = this.osType;
            console.log("\n$ OS $");
            console.log('isMobile:', global.isMobile);
            console.log('BrowserType:', window.browserType);
            console.log('OS:', window.os);
            console.log('\n');
            return this.isMobile;
        }
    },

    getBrowser() {
        let ua = navigator.userAgent;
        let tem;
        let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    },

    getOS() {
        let userAgent = window.navigator.userAgent,
            platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
            macosPlatforms = ['macintosh', 'macintel', 'macppp', 'mac68k', 'mac', 'macos'],
            windowsPlatforms = ['win32', 'win64', 'windows', 'wince'],
            iosPlatforms = ['iphone', 'ipad', 'ipod'],
            os = null;

        let iOSVersion = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
        if (iOSVersion) {
            const versionString = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
            if (versionString && versionString.length > 3) {
                iOSVersion = parseInt(versionString[1], 10);
            }
        }

        platform = platform.toLowerCase();
        if (macosPlatforms.indexOf(platform) !== -1) {
            os = 'macos';
        } else if (iosPlatforms.indexOf(platform) !== -1) {
            os = 'ios';
        } else if (windowsPlatforms.indexOf(platform) !== -1) {
            os = 'windows';
        } else if (/android/.test(userAgent)) {
            os = 'android';
        } else if (/linux/.test(platform)) {
            os = 'linux';
        }
        if (os == null) {
            os = 'unknown';
        }
        return ({ type: os.toLowerCase(), version: iOSVersion });
    },

    getGpuTier() {
        return new Promise((resolve, reject) => {
            getGPUTier({
                failIfMajorPerformanceCaveat: true
            }).then(
                res => {
                    this.gpu = res
                    this.gpu.integrated = res.gpu.indexOf('intel') >= 0;
                    resolve(res);
                },
                e => reject(e)
            );
        })
    },

    getGPU() {
        function extractValue(reg, str) {
            const matches = str.match(reg);
            return matches && matches[0];
        }

        // WebGL Context Setup
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

        // Full card description and webGL layer (if present)
        // const layer = extractValue(/(ANGLE)/g, renderer);
        const card = extractValue(/((NVIDIA|AMD|Intel)[^\d]*[^\s]+)/, renderer);

        const tokens = card.split(' ');
        tokens.shift();

        // Split the card description up into pieces
        // with brand, manufacturer, card version
        const manufacturer = extractValue(/(NVIDIA|AMD|Intel)/g, card);
        const cardVersion = tokens.pop();
        const brand = tokens.join(' ');
        const integrated = manufacturer === 'Intel';

        return ({
            card,
            manufacturer,
            cardVersion,
            brand,
            integrated,
            vendor,
            renderer
        });
    },

    sortArrayByProperty(array, property) {
        function compare(a, b) {
            if (a[property] < b[property]) {
                return -1;
            }
            if (a[property] > b[property]) {
                return 1;
            }
            return 0;
        }

        return array.sort(compare);
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

    countCharacterInString(character, string) {
        return (string.match(new RegExp(character, 'g')) || []).length;
    },

    limitNumberWithinRange(num, min, max) {
        const MIN = min || 1;
        const MAX = max || 20;
        const parsed = parseInt(num)
        return Math.min(Math.max(parsed, MIN), MAX)
    },

    mapValue(number, inMin, inMax, outMin, outMax) {
        return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    reduceArrayToValue(array, initValue) {
        array.reduce(
            (v1, v2) => {
                initValue = v1[v2];
                return initValue
            }, initValue
        );
        return initValue;
    },

    setObjValueFromArray(array, obj, value) {
        let v = obj[array[0]];
        for (let i = 1; i < array.length - 1; i++) {
            v = v[[array[i]]];
        }
        v[array[array.length - 1]] = value;
    }
}

global.mobilecheck = function () {
    var check = false;
    /* eslint-disable no-useless-escape */
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

if (typeof String.prototype.parseFunction != 'function') {
    String.prototype.parseFunction = function () {
        var funcReg = /function *\(([^()]*)\)[ \n\t]*{(.*)}/gmi;
        var match = funcReg.exec(this.replace(/\n/g, ' '));

        if (match) {
            return new Function(match[1].split(','), match[2]);
        }

        return null;
    };
}

export default appUtils;