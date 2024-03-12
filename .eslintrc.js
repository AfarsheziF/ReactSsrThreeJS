module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "parser": "@babel/eslint-parser",
    "rules": {
        "react/prop-types": 0,
        "no-unused-vars": "off"
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    },
    "globals": {
        "__DEV__": "writable"
    }
}
