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
                isAutoDict: await Common.getTabStorage("isAutoDict"),
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
                type: "input",
                handler: AnkiFlash.#translationChangedHandler,
                fields: [{ id: "source", default: Constant.ENGLISH }],
                triggerOptionsIds: [
                    "target",
                    Constant.WORD_TYPES_DICT,
                    Constant.PHONETICS_DICT,
                    Constant.EXAMPLES_DICT,
                    Constant.SOUNDS_DICT,
                    Constant.IMAGES_DICT,
                    Constant.MEANING_DICT,
                ],
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
            },
            {
                type: "input",
                handler: AnkiFlash.#translationChangedHandler,
                fields: [{ id: "target", default: Constant.ENGLISH }],
                triggerOptionsIds: [
                    Constant.WORD_TYPES_DICT,
                    Constant.PHONETICS_DICT,
                    Constant.EXAMPLES_DICT,
                    Constant.SOUNDS_DICT,
                    Constant.IMAGES_DICT,
                    Constant.MEANING_DICT,
                ],
                options: AnkiFlash.#getTargetAsOptions,
            },
            {
                type: "input",
                handler: AnkiFlash.#textboxChangedHandler,
                fields: [
                    { id: "inputTxt" },
                    { id: "outputTxt" },
                    { id: "failureTxt" },
                ],
            },
            {
                type: "checked",
                handler: Common.inputChangedHandler,
                fields: [
                    { id: "relatedWords", default: true },
                    { id: "isOnline", default: true },
                    {
                        handler: AnkiFlash.#isAutoDictChangedHandler,
                        id: "isAutoDict",
                        default: true,
                    },
                ],
            },
            {
                type: "input",
                handler: Common.inputChangedHandler,
                fields: [
                    { id: Constant.WORD_TYPES_DICT, default: Constant.OXFORD },
                    { id: Constant.PHONETICS_DICT, default: Constant.OXFORD },
                    { id: Constant.EXAMPLES_DICT, default: Constant.OXFORD },
                    { id: Constant.SOUNDS_DICT, default: Constant.OXFORD },
                    { id: Constant.IMAGES_DICT, default: Constant.OXFORD },
                    { id: Constant.MEANING_DICT, default: Constant.OXFORD },
                ],
                forceGetOptions: true,
                options: AnkiFlash.#getDictionaryAsOptions,
            },
        ];
        await Common.configDataFields(fieldConfigs);

        for (const fieldId of ["outputTxt", "failureTxt"]) {
            await Common.setFieldValue(fieldId, "");
        }

        for (const fieldId of ["inputTxt", "outputTxt", "failureTxt"]) {
            await AnkiFlash.#calculateCounters(fieldId);
        }

        await AnkiFlash.#displayDictMapping();
    }

    static async #textboxChangedHandler(event) {
        await Common.inputChangedHandler(event);

        let fieldId = event.data.fieldId;
        await AnkiFlash.#calculateCounters(fieldId);
    }

    static async #calculateCounters(fieldId) {
        let txtLines = (await Common.getTabStorage(fieldId))
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

    static async #displayDictMapping() {
        let isAutoDict = await Common.getTabStorage("isAutoDict");
        if (isAutoDict) {
            $("#dictMapping").hide();
            $("#outputTxt").attr("rows", 9);
            $("#failureTxt").attr("rows", 8);
            $("#failureTxt").attr("style", "margin-top: 2px");
            $("#translationLbl").attr("style", "margin-top: 0px");

            for (const dict of [
                "wordTypesDict",
                "phoneticsDict",
                "examplesDict",
                "soundsDict",
                "imagesDict",
                "meaningDict",
            ]) {
                let dictOptions = await AnkiFlash.#getDictionaryAsOptions(dict);
                Common.logDebug(dict, dictOptions);
                await Common.setFieldValue(dict, dictOptions[0].value, true);
            }
        } else {
            $("#dictMapping").show();
            $("#outputTxt").attr("rows", 16);
            $("#failureTxt").attr("rows", 16);
            $("#failureTxt").attr("style", "margin-top: 0px");
            $("#translationLbl").attr("style", "margin-top: 5px");
        }
    }

    static async #isAutoDictChangedHandler(event) {
        await Common.inputChangedHandler(event);
        await AnkiFlash.#displayDictMapping();
    }

    static async #getTargetAsOptions() {
        let source = await Common.getTabStorage("source");
        return Constant.SUPPORTED_TRANSLATIONS.filter(
            (t) => t.translation.source === source
        ).map((t) => {
            return { value: t.translation.target, text: t.translation.target };
        });
    }

    static async #getDictionaryAsOptions(fieldId) {
        let translation = new Translation(
            await Common.getTabStorage("source"),
            await Common.getTabStorage("target")
        );

        let [dictionaries] = Constant.SUPPORTED_TRANSLATIONS.filter((t) =>
            t.translation.equals(translation)
        ).map((t) => t.dictionaries);

        return dictionaries
            .filter((d) => d.fields.includes(fieldId))
            .map((d) => {
                return { value: d.name, text: d.name };
            });
    }

    static async #translationChangedHandler(event) {
        await Common.inputChangedHandler(event);

        let translation = new Translation(
            await Common.getTabStorage("source"),
            await Common.getTabStorage("target")
        );

        let isRelatedWordSupported = translation.belongTo([
            // JISHO
            new Translation(Constant.JAPANESE, Constant.ENGLISH),
            // KANTAN
            new Translation(Constant.JAPANESE, Constant.VIETNAMESE),
            new Translation(Constant.VIETNAMESE, Constant.JAPANESE),
            // OXFORD
            new Translation(Constant.ENGLISH, Constant.ENGLISH),
            // WIKITIONARY
            new Translation(Constant.VIETNAMESE, Constant.VIETNAMESE),
        ]);

        if (!isRelatedWordSupported) {
            Common.setFieldValue("relatedWords", false);
            Common.disableElement("#relatedWords");
        } else {
            Common.setFieldValue("relatedWords", true);
            Common.enableElement("#relatedWords");
        }
    }
}
