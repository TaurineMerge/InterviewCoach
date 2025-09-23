import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    extends: [js.configs.recommended],
    languageOptions: { globals: { ...globals.node } },
  },
  globalIgnores([
    // Build
    "**/node_modules/",
    "**/dist/",

    // Cache and temporaries
    "**/.cache/",
    "**/.eslintcache/",
    "**/.stylelintcache/",

    // Logs
    "**/logs/",
    "**/*.log",
    "**/pnpm-debug.log*",

    // Config files
    "**/eslint.config.js",
    "**/.eslintrc.js",
    "**/.prettierrc.js",
    "**/tsconfig.json",
    "**/tsconfig.*.json",
    "**/package.json",
    "**/pnpm-lock.yaml",

    // Testing
    "**/coverage/",

    // Environment files
    "**/.env",
    "**/.env.*",

    // IDE and editors
    "**/.vscode/",
    "**/.idea/",
    "**/*.swp",
    "**/*.swo",
    "**/*~",

    // Git
    "**/.git/",
    "**/.gitignore",
    "**/.gitattributes",

    // Docker
    "**/Dockerfile",
    "**/docker-compose.yml",
    "**/docker-compose.*.yml",

    // Docs
    "**/docs/",
    "**/README.md",
    "**/CHANGELOG.md",
    "**/LICENSE",

    // Assets
    "**/public/",
    "**/static/",
    "**/uploads/",
    "**/storage/",
  ]),
  tseslint.configs.recommended,
  eslintConfigPrettier,
]);
