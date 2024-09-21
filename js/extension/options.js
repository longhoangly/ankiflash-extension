import { Common } from "../base/common.js";

$(document).ready(async () => {
    await Options.loadConfigsFromStorage();

    $("#saveBtn").click(async () => {
        if (Common.isValidJson($("#options").val())) {
            await Options.saveConfigsToStorage();
            await Options.loadConfigsFromStorage();
            await Common.bootsAlert({
                message: "Configurations saved successfully!",
            });
        } else {
            await Common.bootsAlert({
                message: "Invalid JSON config! Please check your input!",
                isSuccess: false,
            });
        }
    });

    $("#resetBtn").click(async () => {
        await Common.presetOptions();
        await Options.loadConfigsFromStorage();
        await Common.bootsAlert({
            message: "Reset configurations successfully!",
        });
    });
});

export class Options {
    static async loadConfigsFromStorage() {
        let jsonConfig = await Common.getStorage("ankiflashOptions");
        Common.logInfo("storage jsonConfig", jsonConfig);
        $("#options").html(JSON.stringify(jsonConfig, null, 4));
    }

    static async saveConfigsToStorage() {
        let jsonConfig = Common.stringToJson($("#options").val());
        await Common.setStorage("ankiflashOptions", jsonConfig);
    }
}
