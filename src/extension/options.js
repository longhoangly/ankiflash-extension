/** @format */

import { Common } from "../base/common.js";

$(document).ready(async () => {
	await Options.loadConfigsFromStorage();

	$("#saveBtn").click(async () => {
		if (Common.isValidJson($("#options").val())) {
			await Options.saveConfigsToStorage();
			await Options.loadConfigsFromStorage();

			await Common.pushAlert({
				message: "Configurations saved successfully!",
			});
		} else {
			await Common.pushAlert({
				message: "Invalid JSON config! Please check your input!",
				isSuccess: false,
			});
		}
	});

	$("#resetBtn").click(async () => {
		await Common.presetOptions("../data/default-options.json");
		await Options.loadConfigsFromStorage();
		await Common.pushAlert({
			message: "Reset configurations successfully!",
		});
	});
});

export class Options {
	static async loadConfigsFromStorage() {
		const jsonConfig = await Common.getStorage(
			`${chrome.runtime.id}Options`
		);
		Common.logWarn("storage jsonConfig", jsonConfig);
		$("#options").html(JSON.stringify(jsonConfig, null, 4));
	}

	static async saveConfigsToStorage() {
		const jsonConfig = Common.stringToJson($("#options").val());
		await Common.setStorage(`${chrome.runtime.id}Options`, jsonConfig);
	}
}
