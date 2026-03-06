module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "prettier",
  ],
  parserOptions: {
    project: ["./packages/*/tsconfig.json"],
  },
  rules: {
    "@typescript-eslint/no-unused-vars":               "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-explicit-any":              "error",
  },
}
