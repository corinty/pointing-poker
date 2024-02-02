/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    "@remix-run/eslint-config",
    "@remix-run/eslint-config/node",
    "plugin:@shopify/esnext",
    "plugin:@shopify/react",
    "plugin:@shopify/typescript",
    "plugin:@shopify/react",
    "plugin:@shopify/prettier",
  ],
  parserOptions: {
    project: "tsconfig.json",
  },
};
