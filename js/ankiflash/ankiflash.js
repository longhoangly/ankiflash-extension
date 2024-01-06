import { Common } from "../base/common.js";
import { Constant } from "../base/constant.js";
import { Translation } from "./dto/translation.js";
import { CnGen } from "./generator/chinese.js";
import { EnGen } from "./generator/english.js";
import { FrGen } from "./generator/french.js";
import { JpGen } from "./generator/japanese.js";
import { SpGen } from "./generator/spanish.js";
import { VnGen } from "./generator/vietnamese.js";

$(document).ready(async () => {
    // TODO: remove this when submitting to the store
    await Common.presetOptions();

    // Config traffic blocking
    Common.blockTraffics();

    // Reder UI fields
    await AnkiFlash.setupLayout();

    // Register handlers
    AnkiFlash.setupHandlers();

    // Ready logs
    Common.logWarning(
        `=====>>>>>>>>>>>>>>===\n=====>>>>>>>>>>>>>>>>>>>>>=====\nFinished Loading....\nWelcome to AnkiFlash...\n=====>>>>>>>>>>>>>>>>>>>>>=====\n=====>>>>>>>>>>>>>>>>>>>>>=====`
    );
});

export class AnkiFlash {
    static async setupHandlers() {
        $("#btnGenerate").click(async () => {
            let translation = new Translation(
                await Common.getStorage("source"),
                await Common.getStorage("target")
            );

            let words = (await Common.getStorage("inputTxt"))
                .split("\n")
                .filter(Boolean);

            let allWordTypes = await Common.getStorage("allWordTypes");
            let isOnline = await Common.getStorage("isOnline");
            let isAutoDict = await Common.getStorage("isAutoDict");

            Common.logWarning("allWordTypes", allWordTypes);
            Common.logWarning("isOnline", isOnline);
            Common.logWarning("isAutoDict", isAutoDict);

            let gen = await AnkiFlash.#initializeGenerator(translation);
            Common.logWarning("gen", gen);

            gen.generateCards(words, allWordTypes, isOnline);

            let wordTypesDict = await Common.getStorage("wordTypesDict");
            let phoneticsDict = await Common.getStorage("phoneticsDict");
            let examplesDict = await Common.getStorage("examplesDict");
            let soundsDict = await Common.getStorage("soundsDict");
            let imagesDict = await Common.getStorage("imagesDict");
            let contentDict = await Common.getStorage("contentDict");
            Common.logWarning(
                "dicts",
                wordTypesDict,
                phoneticsDict,
                examplesDict,
                soundsDict,
                imagesDict,
                contentDict
            );

            Common.logWarning(Constant.FINISHED_MSG);
        });

        $("#btnCancel").click(async () => {
            alert("Cancel btn clicked!");
        });

        $("#btnDownload").click(async () => {
            alert("Download btn clicked!");
        });
    }

    static async #initializeGenerator(transation) {
        switch (transation.source) {
            case Constant.ENGLISH:
                return new EnGen(transation);
            case Constant.JAPANESE:
                return new JpGen(transation);
            case Constant.VIETNAMESE:
                return new VnGen(transation);
            case Constant.FRENCH:
                return new FrGen(transation);
            case Constant.SPANISH:
                return new SpGen(transation);
            case Constant.CHINESE || Constant.CHINESE_TD || Constant.CHINESE_SP:
                return new CnGen(transation);
            default:
                return new EnGen(transation);
        }
    }

    static async setupLayout() {
        let fieldConfigs = [
            {
                type: "input",
                handler: Common.inputChangedHandler,
                fields: [{ id: "source", default: "English" }],
                triggerOptionsIds: ["target"],
                options: [
                    {
                        value: "Vietnamese",
                        text: "Vietnamese",
                    },
                    {
                        value: "English",
                        text: "English",
                    },
                    {
                        value: "French",
                        text: "French",
                    },
                    {
                        value: "Japanese",
                        text: "Japanese",
                    },
                ],
            },
            {
                type: "input",
                handler: Common.inputChangedHandler,
                fields: [{ id: "target", default: "English" }],
                options: AnkiFlash.getTargetAsOptions,
            },
            {
                type: "input",
                handler: Common.inputChangedHandler,
                fields: [
                    { id: "inputTxt", default: "" },
                    { id: "outputTxt", default: "" },
                    { id: "failureTxt", default: "" },
                ],
            },
            {
                type: "checked",
                handler: Common.inputChangedHandler,
                fields: [
                    { id: "allWordTypes", default: true },
                    { id: "isOnline", default: true },
                    {
                        handler: AnkiFlash.isAutoDictChangedHandler,
                        id: "isAutoDict",
                        default: true,
                    },
                ],
            },
            {
                type: "input",
                handler: Common.inputChangedHandler,
                fields: [
                    { id: "wordTypesDict", default: "oxford" },
                    { id: "phoneticsDict", default: "oxford" },
                    { id: "examplesDict", default: "oxford" },
                    { id: "soundsDict", default: "oxford" },
                    { id: "imagesDict", default: "oxford" },
                    { id: "contentDict", default: "oxford" },
                ],
                options: [
                    {
                        value: "lacViet",
                        text: "Lac Viet",
                    },
                    {
                        value: "oxford",
                        text: "Oxford",
                    },
                    {
                        value: "cambridge",
                        text: "Cambridge",
                    },
                    {
                        value: "collins",
                        text: "Collins",
                    },
                    {
                        value: "kantan",
                        text: "Kantan",
                    },
                    {
                        value: "jisho",
                        text: "Jisho",
                    },
                ],
            },
        ];
        await Common.configDataFields(fieldConfigs);
        await AnkiFlash.#displayDictMapping();
    }

    static async #displayDictMapping() {
        let isAutoDict = await Common.getStorage("isAutoDict");
        if (isAutoDict) {
            $("#dictMapping").hide("fast");
        } else {
            $("#dictMapping").show("fast");
        }
    }

    static async isAutoDictChangedHandler(event) {
        await Common.inputChangedHandler(event);
        await AnkiFlash.#displayDictMapping();
    }

    static async getTargetAsOptions() {
        let source = await Common.getStorage("source");

        let supportedTranslations = [];
        for (const translations of Object.values(
            Constant.SUPPORTED_TRANSLATIONS_BY_DICTS
        )) {
            supportedTranslations = supportedTranslations.concat(translations);
        }

        return supportedTranslations
            .filter((t) => t.source === source)
            .map((t) => {
                return { value: t.target, text: t.target };
            });
    }

    static async getDictionaryAsOptions() {
        let translation = new Translation(
            await Common.getStorage("source"),
            await Common.getStorage("target")
        );

        let supportedDictonaries = [];
        switch (translation) {
            case Constant.EN_EN:
                supportedDictonaries = [
                    Constant.ENGLISH,
                    Constant.VIETNAMESE,
                    Constant.CHINESE_TD,
                    Constant.CHINESE_SP,
                    Constant.FRENCH,
                    Constant.JAPANESE,
                ];
                break;
            case Constant.VIETNAMESE:
                supportedDictonaries = [
                    Constant.ENGLISH,
                    Constant.FRENCH,
                    Constant.JAPANESE,
                    Constant.VIETNAMESE,
                ];
                break;
            case Constant.FRENCH:
                supportedDictonaries = [Constant.ENGLISH, Constant.VIETNAMESE];
                break;
            case Constant.JAPANESE:
                supportedDictonaries = [Constant.ENGLISH, Constant.VIETNAMESE];
                break;
        }

        return supportedDictonaries.map((t) => {
            return { value: t, text: t };
        });
    }
}
