/** @format */

const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
	entry: {
		background: "./src/extension/background.js",
		options: "./src/extension/options.js",
		ankiflash: "./src/ankiflash/ankiflash.js",
	},
	output: {
		filename: "bundle/[name].bundle.js",
		path: path.resolve(__dirname, "dist"),
		// clean: true,
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				"./static/manifest.json",
				{ from: "static", to: "static" },
			],
		}),
		new CleanWebpackPlugin(),
	],
};
