/** @format */

import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ files: ["**/*.{js,mjs,cjs,ts}"] },
	{
		languageOptions: {
			globals: {
				...globals.devtools,
				...globals.jquery,
				...globals.browser,
				...globals.node,
				...globals.commonjs,
			},
			rules: {
				"@typescript-eslint/no-var-requires": "off",
			},
		},
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
];
