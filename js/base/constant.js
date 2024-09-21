import { Base } from "./base.js";
import { Translation } from "../ankiflash/dto/translation.js";

export class Constant extends Base {
    //=====FRAMEWORK=====
    static TODAY = Constant.getJsonDate();
    static AUTO_COMPLETE_FIELD_IDS = [];
    static FINISHED_MSG = "===>>>>>>> Finished Execution ===>>>>>>>";

    //=====APP=====

    // ANKI
    static ANKI_DECK = "anki_deck.csv";
    static MAPPING_CSV = "ankiflash_mapping.csv";
    static NO_EXAMPLE = "No example {{c1::...}}";
    static COPYRIGHT =
        "This card's content is collected from the following dictionaries: {}";

    // OXFORD
    static OX_BASE_URL = "https://www.oxfordlearnersdictionaries.com";
    static OX_EN_EN_SEARCH_URL = `${Constant.OX_BASE_URL}/search/english/direct/?q={}`;

    // LACVIET
    static LV_BASE_URL = "http://tratu.coviet.vn";
    static LV_SEARCH_URL = `${Constant.LV_BASE_URL}/ajax/TraTu.Util.AjaxFunction,App_Code.ashx?_method=GetComplete&_session=no`;

    // CAMBRIDGE
    static CB_BASE_URL = "https://dictionary.cambridge.org";
    static CB_EN_FR_URL = `${Constant.CB_BASE_URL}/search/english-french/direct/?q={}`;
    static CB_EN_JP_URL = `${Constant.CB_BASE_URL}/search/english-japanese/direct/?q={}`;
    static CB_EN_CN_TD_URL = `${Constant.CB_BASE_URL}/search/english-chinese-traditional/direct/?q={}`;
    static CB_EN_CN_SP_URL = `${Constant.CB_BASE_URL}/search/english-chinese-simplified/direct/?q={}`;

    // COLLINS
    static CL_BASE_URL = "https://www.collinsdictionary.com";
    static CL_FR_EN_URL = `${Constant.CL_BASE_URL}/search/?dictCode=french-english&q={}`;

    // KANTAN
    static KT_BASE_URL = "https://kantan.vn";
    static KT_VNJP_JPVN_URL = `${Constant.KT_BASE_URL}/postrequest.ashx`;

    // JISHO
    static JS_BASE_URL = "https://jisho.org";
    static JS_JP_EN_URL = `${Constant.JS_BASE_URL}/word/{}`;
    static JS_JP_EN_SEARCH_URL = `${Constant.JS_BASE_URL}/search/{}`;

    // LANGUAGES (1)
    static ENGLISH = "English";
    static FRENCH = "French";
    static VIETNAMESE = "Vietnamese";
    static JAPANESE = "Japanese";
    static SPANISH = "Spanish";
    static CHINESE_TD = "Chinese (Traditional)";
    static CHINESE_SP = "Chinese (Simplified)";

    // DICTIONARIES (2)
    static LACVIET = "Lacviet";
    static WIKTIONARY = "Wiktionary";
    static OXFORD = "Oxford";
    static CAMBRIDGE = "Cambridge";
    static COLLINS = "Collins";
    static KANTAN = "Kantan";
    static JISHO = "Jisho";

    // TRANSLATIONS (3)
    static SUPPORTED_TRANSLATIONS = [
        // ENGLISH ---> xxx
        {
            translation: new Translation(Constant.ENGLISH, Constant.ENGLISH),
            dictionaries: [
                {
                    name: Constant.OXFORD,
                },
            ],
        },
        {
            translation: new Translation(Constant.ENGLISH, Constant.VIETNAMESE),
            dictionaries: [
                {
                    name: Constant.LACVIET,
                },
            ],
        },
        {
            translation: new Translation(Constant.ENGLISH, Constant.FRENCH),
            dictionaries: [
                {
                    name: Constant.CAMBRIDGE,
                },
            ],
        },
        {
            translation: new Translation(Constant.ENGLISH, Constant.JAPANESE),
            dictionaries: [
                {
                    name: Constant.CAMBRIDGE,
                },
            ],
        },
        {
            translation: new Translation(Constant.ENGLISH, Constant.CHINESE_TD),
            dictionaries: [
                {
                    name: Constant.CAMBRIDGE,
                },
            ],
        },
        {
            translation: new Translation(Constant.ENGLISH, Constant.CHINESE_SP),
            dictionaries: [
                {
                    name: Constant.CAMBRIDGE,
                },
            ],
        },
        // VIETNAMESE ---> xxx
        {
            translation: new Translation(
                Constant.VIETNAMESE,
                Constant.VIETNAMESE
            ),
            dictionaries: [
                {
                    name: Constant.LACVIET,
                },
                {
                    name: Constant.WIKTIONARY,
                },
            ],
        },
        {
            translation: new Translation(Constant.VIETNAMESE, Constant.ENGLISH),
            dictionaries: [
                {
                    name: Constant.LACVIET,
                },
            ],
        },
        {
            translation: new Translation(Constant.VIETNAMESE, Constant.FRENCH),
            dictionaries: [
                {
                    name: Constant.LACVIET,
                },
            ],
        },
        {
            translation: new Translation(
                Constant.VIETNAMESE,
                Constant.JAPANESE
            ),
            dictionaries: [
                {
                    name: Constant.KANTAN,
                },
            ],
        },
        // FRENCH ---> xxx
        {
            translation: new Translation(Constant.FRENCH, Constant.VIETNAMESE),
            dictionaries: [
                {
                    name: Constant.LACVIET,
                },
            ],
        },
        {
            translation: new Translation(Constant.FRENCH, Constant.ENGLISH),
            dictionaries: [
                {
                    name: Constant.COLLINS,
                },
            ],
        },
        // JAPANESE ---> xxx
        {
            translation: new Translation(
                Constant.JAPANESE,
                Constant.VIETNAMESE
            ),
            dictionaries: [
                {
                    name: Constant.KANTAN,
                },
            ],
        },
        {
            translation: new Translation(Constant.JAPANESE, Constant.ENGLISH),
            dictionaries: [
                {
                    name: Constant.JISHO,
                },
            ],
        },
    ];
}
