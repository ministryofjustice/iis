module.exports = {
    "extends": "google",
    "parserOptions": {
        "ecmaVersion": 6
    },
    "globals":{
        "jQuery": false,
        "$": true
    },
    "rules": {
        "comma-dangle": ["error", "never"],
        "max-len": ["error", 120, 4],
        "padded-blocks": "off",
        "no-trailing-spaces": "off",
        "require-jsdoc": "off"
    }
}
;
