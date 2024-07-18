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
                words: (await Common.getStorage("inputTxt"))
                    .split("\n")
                    .filter(Boolean),
                translation: new Translation(
                    await Common.getStorage("source"),
                    await Common.getStorage("target")
                ),
                relatedWords: await Common.getStorage("relatedWords"),
                isOnline: await Common.getStorage("isOnline"),
                isAutoDict: await Common.getStorage("isAutoDict"),
                dictionaries: {
                    wordTypesDict: await Common.getStorage("wordTypesDict"),
                    phoneticsDict: await Common.getStorage("phoneticsDict"),
                    examplesDict: await Common.getStorage("examplesDict"),
                    soundsDict: await Common.getStorage("soundsDict"),
                    imagesDict: await Common.getStorage("imagesDict"),
                    meaningDict: await Common.getStorage("meaningDict"),
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

            Common.logWarn(Constant.FINISHED_MSG);
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
        let txtLines = (await Common.getStorage(fieldId))
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
        let isAutoDict = await Common.getStorage("isAutoDict");
        if (isAutoDict) {
            $("#dictMapping").hide();
            $("#outputTxt").attr("rows", 9);
            $("#failureTxt").attr("rows", 9);

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
            $("#failureTxt").attr("style", "margin-top: 11px");
        }
    }

    static async #isAutoDictChangedHandler(event) {
        await Common.inputChangedHandler(event);
        await AnkiFlash.#displayDictMapping();
    }

    static async #getTargetAsOptions() {
        let source = await Common.getStorage("source");
        return Constant.SUPPORTED_TRANSLATIONS.filter(
            (t) => t.translation.source === source
        ).map((t) => {
            return { value: t.translation.target, text: t.translation.target };
        });
    }

    static async #getDictionaryAsOptions(fieldId) {
        let translation = new Translation(
            await Common.getStorage("source"),
            await Common.getStorage("target")
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
            await Common.getStorage("source"),
            await Common.getStorage("target")
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
