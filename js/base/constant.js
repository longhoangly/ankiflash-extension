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
    static OX_WRONG_SPELLING = "Did you spell it correctly?";
    static OX_WORD_NOT_FOUND =
        "Oxford Learner's Dictionaries | Find the meanings";
    static OX_EN_EN_URL =
        "https://www.oxfordlearnersdictionaries.com/definition/english/{}";
    static OX_EN_EN_SEARCH_URL =
        "https://www.oxfordlearnersdictionaries.com/search/english/direct/?q={}";

    // LACVIET
    static LV_WRONG_SPELLING = "Dữ liệu đang được cập nhật";
    static LV_VN_EN_URL =
        "http://tratu.coviet.vn/tu-dien-lac-viet.aspx?learn=hoc-tieng-anh&t=V-A&k={}";
    static LV_VN_FR_URL =
        "http://tratu.coviet.vn/tu-dien-lac-viet.aspx?learn=hoc-tieng-phap&t=V-F&k={}";
    static LV_VN_VN_URL =
        "http://tratu.coviet.vn/tu-dien-lac-viet.aspx?learn=hoc-tieng-phap&t=V-V&k={}";
    static LV_EN_VN_URL =
        "http://tratu.coviet.vn/tu-dien-lac-viet.aspx?learn=hoc-tieng-anh&t=A-V&k={}";
    static LV_FR_VN_URL =
        "http://tratu.coviet.vn/tu-dien-lac-viet.aspx?learn=hoc-tieng-phap&t=F-V&k={}";

    // CAMBRIDGE
    static CB_WRONG_SPELLING = "Did you spell it correctly?";
    static CB_EN_FR_URL =
        "https://dictionary.cambridge.org/search/english-french/direct/?q={}";
    static CB_EN_JP_URL =
        "https://dictionary.cambridge.org/search/english-japanese/direct/?q={}";
    static CB_EN_CN_TD_URL =
        "https://dictionary.cambridge.org/search/english-chinese-traditional/direct/?q={}";
    static CB_EN_CN_SP_URL =
        "https://dictionary.cambridge.org/search/english-chinese-simplified/direct/?q={}";

    // COLLINS
    static CL_WRONG_SPELLING = "Sorry, no results for";
    static CL_FR_EN_URL =
        "https://www.collinsdictionary.com/search/?dictCode=french-english&q={}";

    // KANTAN
    static KT_VNJP_JPVN_URL = "https://kantan.vn/postrequest.ashx";

    // JISHO
    static JS_WORD_NOT_FOUND = "Sorry, couldn't find anything matching";
    static JS_JP_EN_URL = "https://jisho.org/word/{}";
    static JS_JP_EN_SEARCH_URL = "https://jisho.org/search/{}";

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

    // FIELDS (3)
    static WORD_TYPES_DICT = "wordTypesDict";
    static PHONETICS_DICT = "phoneticsDict";
    static EXAMPLES_DICT = "examplesDict";
    static SOUNDS_DICT = "soundsDict";
    static IMAGES_DICT = "imagesDict";
    static MEANING_DICT = "meaningDict";

    // TRANSLATIONS (3)
    static SUPPORTED_TRANSLATIONS = [
        // ENGLISH ---> xxx
        {
            translation: new Translation(Constant.ENGLISH, Constant.ENGLISH),
            dictionaries: [
                {
                    name: Constant.OXFORD,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        {
            translation: new Translation(Constant.ENGLISH, Constant.VIETNAMESE),
            dictionaries: [
                {
                    name: Constant.LACVIET,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        {
            translation: new Translation(Constant.ENGLISH, Constant.FRENCH),
            dictionaries: [
                {
                    name: Constant.CAMBRIDGE,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        {
            translation: new Translation(Constant.ENGLISH, Constant.JAPANESE),
            dictionaries: [
                {
                    name: Constant.CAMBRIDGE,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        {
            translation: new Translation(Constant.ENGLISH, Constant.CHINESE_TD),
            dictionaries: [
                {
                    name: Constant.CAMBRIDGE,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        {
            translation: new Translation(Constant.ENGLISH, Constant.CHINESE_SP),
            dictionaries: [
                {
                    name: Constant.CAMBRIDGE,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        // VIETNAMESE ---> xxx
        {
            translation: new Translation(Constant.VIETNAMESE, Constant.ENGLISH),
            dictionaries: [
                {
                    name: Constant.LACVIET,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        {
            translation: new Translation(Constant.VIETNAMESE, Constant.FRENCH),
            dictionaries: [
                {
                    name: Constant.LACVIET,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
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
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        {
            translation: new Translation(
                Constant.VIETNAMESE,
                Constant.VIETNAMESE
            ),
            dictionaries: [
                {
                    name: Constant.LACVIET,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
                {
                    name: Constant.WIKTIONARY,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        // FRENCH ---> xxx
        {
            translation: new Translation(Constant.FRENCH, Constant.VIETNAMESE),
            dictionaries: [
                {
                    name: Constant.LACVIET,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        {
            translation: new Translation(Constant.FRENCH, Constant.ENGLISH),
            dictionaries: [
                {
                    name: Constant.COLLINS,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        // JAPANESE ---> xxx
        {
            translation: new Translation(Constant.JAPANESE, Constant.ENGLISH),
            dictionaries: [
                {
                    name: Constant.JISHO,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
        {
            translation: new Translation(
                Constant.JAPANESE,
                Constant.VIETNAMESE
            ),
            dictionaries: [
                {
                    name: Constant.KANTAN,
                    fields: [
                        Constant.WORD_TYPES_DICT,
                        Constant.PHONETICS_DICT,
                        Constant.EXAMPLES_DICT,
                        Constant.SOUNDS_DICT,
                        Constant.IMAGES_DICT,
                        Constant.MEANING_DICT,
                    ],
                },
            ],
        },
    ];
}
