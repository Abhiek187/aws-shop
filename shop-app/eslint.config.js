import eslint from "@eslint/js";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

// Mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Preview: npx @eslint/config-inspector
export default tseslint.config(
  {
    // Global ignores
    ignores: ["dist/", "coverage/", "*.js"],
  },
  eslint.configs.recommended,
  // Use TS config only for TS files: https://stackoverflow.com/a/64488474
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  reactRecommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest",
        project: ["./tsconfig.json", "./tsconfig.node.json"],
        tsconfigRootDir: __dirname, // use import.meta.dirname in Node 20+
        sourceType: "module",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      "react-refresh": reactRefresh,
    },
    rules: {
      // Suppress errors for missing 'import React' in files
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  }
);
