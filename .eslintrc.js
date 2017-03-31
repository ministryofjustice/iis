module.exports = {
    "extends": "google",
    "parserOptions": {
        "ecmaVersion": 6
    },
    "env": {
        "node": true
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
        "require-jsdoc": "off",
        "no-undef": "error"
    }
}
;
