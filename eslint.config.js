const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const prettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["dist/**", "**/*.config.js", "**/*.config.ts", "**/*.test.js", "**/*.test.ts"],
  },
  prettier,
  {
    files: ["**/*.{js,ts,tsx}"],
    rules: {
      semi: "error",
      "no-tabs": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { parser: tsParser },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
        },
        {
          selector: "variable",
          format: ["camelCase"],
        },
        {
          selector: ["variable", "function"],
          modifiers: ["global"],
          format: ["PascalCase", "camelCase"],
        },
        {
          selector: "variable",
          modifiers: ["const"],
          format: ["camelCase", "UPPER_CASE"],
        },
        {
          selector: ["variable", "function"],
          modifiers: ["exported"],
          format: ["PascalCase", "camelCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase"],
        },
        {
          selector: "memberLike",
          modifiers: ["private"],
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "enumMember",
          format: ["PascalCase"],
        },
        {
          selector: "interface",
          format: ["PascalCase"],
          prefix: ["I"],
        },
        {
          selector: "typeProperty",
          format: ["camelCase", "PascalCase", "snake_case"],
        },
        {
          selector: ["classProperty", "classMethod"],
          modifiers: ["public"],
          format: ["PascalCase", "camelCase"],
        },
        {
          selector: "typeParameter",
          format: ["PascalCase"],
          prefix: ["T"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
    },
  },
];
