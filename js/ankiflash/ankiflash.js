import { Common } from "../base/common.js";
import { Constant } from "../base/constant.js";
import { Translation } from "./dto/translation.js";
import { Generator } from "./generator.js";

$(document).ready(async () => {
    // Reder UI fields
    await AnkiFlash.setupLayout();

    // Register handlers
    AnkiFlash.addHandlers();

    // Ready logs
    Common.logWarn("==========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>========");
    Common.logWarn("==========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>========");
    Common.logWarn("===== Finished Loading.... ====================");
    Common.logWarn("===== Welcome to AnkiFlash Generator ==========");
    Common.logWarn("==========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>========");
    Common.logWarn("==========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>========");
});

export class AnkiFlash {
    static async addHandlers() {
        $("#btnGenerate").click(async () => {
            let genInputDto = {
                words: (await Common.getTabStorage("inputTxt"))
                    .split("\n")
                    .filter(Boolean),
                translation: new Translation(
                    await Common.getTabStorage("source"),
                    await Common.getTabStorage("target")
                ),
                relatedWords: await Common.getTabStorage("relatedWords"),
                isOnline: await Common.getTabStorage("isOnline"),
                dictionaries: {
                    wordTypesDict: await Common.getTabStorage("wordTypesDict"),
                    phoneticsDict: await Common.getTabStorage("phoneticsDict"),
                    examplesDict: await Common.getTabStorage("examplesDict"),
                    soundsDict: await Common.getTabStorage("soundsDict"),
                    imagesDict: await Common.getTabStorage("imagesDict"),
                    meaningDict: await Common.getTabStorage("meaningDict"),
                },
            };

            genInputDto.dictionaries.combinedDicts = Common.distinctArray([
                genInputDto.dictionaries.wordTypesDict,
                genInputDto.dictionaries.phoneticsDict,
                genInputDto.dictionaries.examplesDict,
                genInputDto.dictionaries.soundsDict,
                genInputDto.dictionaries.imagesDict,
                genInputDto.dictionaries.meaningDict,
            ]);

            let gen = new Generator(genInputDto);
            Common.logWarn("gen", gen);

            let cards = await gen.generateCards();
            Common.logWarn("cards", cards);

            await gen.generateCsv(cards);
            Common.logWarn(Constant.FINISHED_MSG);
        });

        $("#btnCancel").click(async () => {
            await Common.setTabStorage("isCanceled", true);
        });
    }

    static async setupLayout() {
        let fieldConfigs = [
            {
                fields: [{ id: "source", default: Constant.ENGLISH }],
                handler: Common.inputChangedHandler,
                options: [
                    {
                        value: Constant.VIETNAMESE,
                        text: Constant.VIETNAMESE,
                    },
                    {
                        value: Constant.ENGLISH,
                        text: Constant.ENGLISH,
                    },
                    {
                        value: Constant.FRENCH,
                        text: Constant.FRENCH,
                    },
                    {
                        value: Constant.JAPANESE,
                        text: Constant.JAPANESE,
                    },
                ],
                triggers: [
                    { id: "target", options: true, handler: true },
                    { id: "mainDict", options: true, handler: true },
                ],
            },
            {
                fields: [{ id: "target", default: Constant.ENGLISH }],
                handler: Common.inputChangedHandler,
                options: AnkiFlash.#getTargetAsOptions,
                triggers: [{ id: "mainDict", options: true, handler: true }],
            },
            {
                fields: [{ id: "mainDict", default: Constant.OXFORD }],
                handler: AnkiFlash.#mainDictChangedHandler,
                options: AnkiFlash.#getDictionaryAsOptions,
            },
            {
                fields: [
                    { id: "isOnline", default: true },
                    { id: "relatedWords", default: true },
                ],
                handler: Common.inputChangedHandler,
            },
            {
                fields: [
                    { id: "inputTxt" },
                    { id: "outputTxt" },
                    { id: "failureTxt" },
                ],
                handler: AnkiFlash.#textboxChangedHandler,
            },
        ];
        await Common.configUniversalFields(fieldConfigs);

        // Reset value of output and failure boxes
        for (const fieldId of ["outputTxt", "failureTxt"]) {
            await Common.setFieldValue(fieldId, "");
        }

        // init counters' values
        for (const fieldId of ["inputTxt", "outputTxt", "failureTxt"]) {
            await AnkiFlash.#calculateCounters(fieldId);
        }

        $("#outputTxt").attr("rows", 11);
        $("#failureTxt").attr("rows", 10);
        $("#failureTxt").attr("style", "margin-top: -2px");
    }

    static async #textboxChangedHandler(event) {
        await Common.inputChangedHandler(event);
        const fieldId = event.data.fieldId;
        await AnkiFlash.#calculateCounters(fieldId);
    }

    static async #calculateCounters(fieldId) {
        const txtLines = ((await Common.getTabStorage(fieldId)) || "")
            .split("\n")
            .filter(Boolean);

        switch (fieldId) {
            case "inputTxt":
                $("#totalLbl").html(`Total: ${txtLines.length}`);
                break;
            case "outputTxt":
                $("#outputLbl").html(`Completed: ${txtLines.length}`);
                break;
            case "failureTxt":
                $("#failureLbl").html(`Failure: ${txtLines.length}`);
                break;
        }
    }

    static async #getTargetAsOptions(event) {
        const source = await Common.getTabStorage("source");
        return Constant.SUPPORTED_TRANSLATIONS.filter(
            (t) => t.translation.source === source
        ).map((t) => {
            return { value: t.translation.target, text: t.translation.target };
        });
    }

    static async #getDictionaryAsOptions(event) {
        const translation = new Translation(
            await Common.getTabStorage("source"),
            await Common.getTabStorage("target")
        );

        const [dictionaries] = Constant.SUPPORTED_TRANSLATIONS.filter((t) =>
            t.translation.equals(translation)
        ).map((t) => t.dictionaries);

        return dictionaries.map((d) => {
            return { value: d.name, text: d.name };
        });
    }

    static async #mainDictChangedHandler(event) {
        const mainDict = await Common.inputChangedHandler(event);

        const isRelatedWordSupported = [
            Constant.JISHO,
            Constant.KANTAN,
            Constant.OXFORD,
            Constant.WIKTIONARY,
        ].includes(mainDict);

        if (isRelatedWordSupported) {
            Common.enableElement("#relatedWords");
        } else {
            Common.setFieldValue("relatedWords", false);
            Common.disableElement("#relatedWords");
        }
    }
}
