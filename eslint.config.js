import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["coverage/**", "dist/**", "node_modules/**", "miniprogram/miniprogram_npm/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        App: "readonly",
        Page: "readonly",
        getApp: "readonly",
        wx: "readonly"
      },
      sourceType: "module"
    }
  }
];
