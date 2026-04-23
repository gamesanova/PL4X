import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import jsdoc from "eslint-plugin-jsdoc";

export default tseslint.config(
  { ignores: ["dist"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsdoc.configs['flat/recommended-typescript'],
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "quotes": ["error", "single"],
      "object-curly-spacing": ["error", "always"],
      "semi": ["error", "always"],
      "comma-dangle": ["error", "always-multiline"],
      "space-before-function-paren": ["error", "never"],
      "keyword-spacing": ["error", { "before": true, "after": true }],
      "space-infix-ops": ["error"],
      "eol-last": ["error", "always"],
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "jsdoc/multiline-blocks": ["error", { "noSingleLineBlocks": true }],
      "jsdoc/require-hyphen-before-param-description": ["error", "always"],
    },
  },
);