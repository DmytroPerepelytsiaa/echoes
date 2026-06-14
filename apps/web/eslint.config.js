import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    rules: {
      // TypeScript already validates component props; this rule produces
      // false positives on typed forwardRef components.
      "react/prop-types": "off",
    },
  },
];
