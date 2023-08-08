import { Common } from "../base/common.js";

$(document).ready(async () => {
    // NOTE: hardcode to configurations from json file!!
    await Common.presetOptions();

    // Config traffic blocking
    Common.blockTraffics();

    // Reder UI fields
    await Index.setupLayout();

    // Involve handlers
    Index.setupHandlers();

    Common.logWarning("ABC {1} {2} {3}".format(12, 32, "ahd"))

    Common.logWarning(
        `=====>>>>>>>>>>>>>>===\n=====>>>>>>>>>>>>>>>>>>>>>=====\nFinished Loading....\nWelcome to AnkiFlash...\n=====>>>>>>>>>>>>>>>>>>>>>=====\n=====>>>>>>>>>>>>>>>>>>>>>=====`
    );
});

export class Index {
    static async setupHandlers() {
        $("#btnGenerate").click(async () => {
            let words = $("#inputTxt").val().split("\n").filter(Boolean);

            alert("Generate btn clicked!");
        });

        $("#btnCancel").click(async () => {
            alert("Cancel btn clicked!");
        });

        $("#btnDownload").click(async () => {
            alert("Download btn clicked!");
        });
    }

    static async setupLayout() {
        let fieldConfigs = [
            {
                type: "input",
                handler: Common.inputChangedHandler,
                fields: [{ id: "source", default: "english" }],
                options: [
                    {
                        value: "vietnamese",
                        text: "Vietnamese",
                    },
                    {
                        value: "english",
                        text: "English",
                    },
                    {
                        value: "french",
                        text: "French",
                    },
                    {
                        value: "japanese",
                        text: "Japanese",
                    },
                ],
            },
            {
                type: "input",
                handler: Common.inputChangedHandler,
                fields: [{ id: "target", default: "english" }],
                options: [
                    {
                        value: "vietnamese",
                        text: "Vietnamese",
                    },
                    {
                        value: "english",
                        text: "English",
                    },
                    {
                        value: "french",
                        text: "French",
                    },
                    {
                        value: "chineseTd",
                        text: "Chinese (Traditional)",
                    },
                    {
                        value: "chineseSp",
                        text: "Chinese (Simplified)",
                    },
                    {
                        value: "japanese",
                        text: "Japanese",
                    },
                ],
            },
            {
                type: "checked",
                handler: Common.inputChangedHandler,
                fields: [
                    { id: "allWordTypes", default: true },
                    { id: "onlineSound", default: true },
                ],
            },
        ];
        Common.configDataFields(fieldConfigs);
    }
}
