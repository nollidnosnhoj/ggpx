/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  extends: ["eslint:recommended", "next", "prettier", "turbo"],
  settings: {
    next: {
      rootDir: ["apps/*/", "packages/*/"],
    },
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      plugins: ["@typescript-eslint"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
        sourceType: "module",
      },
    },
  ],
  reportUnusedDisableDirectives: true,
  ignorePatterns: [
    ".eslintrc.js",
    "*.config.js",
    "*.config.cjs",
    "packages/config/**",
  ],
};

module.exports = config;
