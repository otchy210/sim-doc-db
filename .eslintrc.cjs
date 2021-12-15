module.exports = {
    "env": {
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": 13,
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "no-case-declarations": "off",
        "prettier/prettier": ["error", {
            "tabWidth": 4,
            "singleQuote": true,
            "printWidth": 160,
        }]
    }
};
