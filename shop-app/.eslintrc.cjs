module.exports = {
  env: { browser: true, es2020: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["react-refresh"],
  ignorePatterns: ["*.js", ".eslintrc.cjs"],
  rules: {
    "react-refresh/only-export-components": "warn",
  },
};
