module.exports = {
  root: true,
  env: {
    es2021: true,
    node: true,
  },
  overrides: [
    {
      files: ["./**/*.ts", "./**/*.js"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["./tsconfig.json", "./**/{t,j}sconfig.json"],
      },
      plugins: ["@typescript-eslint"],
    },
  ],
  ignorePatterns: ["./**/node_modules", "node_modules", "./**/lib", "lib"],
  rules: {},
};
