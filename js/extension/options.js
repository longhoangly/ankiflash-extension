import { Common } from "../base/common.js";

$(document).ready(async () => {
    await Options.loadConfigsFromStorage();

    $("#saveBtn").click(async () => {
        if (Common.isValidJson($("#options").val())) {
            await Options.saveConfigsToStorage();
            await Options.loadConfigsFromStorage();
            Common.displayUiAlert("Configurations saved successfully!");
        } else {
            Common.displayUiAlert(
                "Invalid JSON config! Please check your input!",
                false
            );
        }
    });

    $("#resetBtn").click(async () => {
        await Common.presetOptions();
        await Options.loadConfigsFromStorage();
        Common.displayUiAlert("Reset configurations successfully!");
    });
});

export class Options {
    static async loadConfigsFromStorage() {
        let jsonConfig = await Common.getStorage("masterConfig");
        Common.logInfo("storage jsonConfig", jsonConfig);
        $("#options").html(JSON.stringify(jsonConfig, null, 4));
    }

    static async saveConfigsToStorage() {
        let jsonConfig = Common.stringToJson($("#options").val());
        await Common.setStorage("masterConfig", jsonConfig);

        let flattenConfig = await Common.flattenJSON(jsonConfig);
        for (let key in flattenConfig) {
            Common.logInfo(key, flattenConfig[key]);

            if (Array.isArray(flattenConfig[key])) {
                await Common.setStorage(key, flattenConfig[key].join(","));
            } else {
                await Common.setStorage(key, flattenConfig[key]);
            }
        }
    }
}
