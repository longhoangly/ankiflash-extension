import { Translation } from "../ankiflash/dto/translation.js";
import { Base } from "./base.js";

export class Constant extends Base {
    static TODAY = Base.getCurrentDate();

    static AUTO_COMPLETE_FIELD_IDS = [];

    static FINISHED_MSG = "===>>>>>>> Finished Execution ===>>>>>>>";

    // ANKI
    static ANKI_DECK = "anki_deck.csv";
    static MAPPING_CSV = "mapping.csv";

    // OXFORD
    static OXFORD_SPELLING_WRONG = "Did you spell it correctly?";
    static OXFORD_WORD_NOT_FOUND =
        "Oxford Learner's Dictionaries | Find the meanings";
    static OXFORD_URL_EN_EN =
        "https://www.oxfordlearnersdictionaries.com/definition/english/{}";
    static OXFORD_SEARCH_URL_EN_EN =
        "https://www.oxfordlearnersdictionaries.com/search/english/direct/?q={}";

    // LACVIET
    static LACVIET_SPELLING_WRONG = "Dữ liệu đang được cập nhật";
    static LACVIET_URL_VN_EN =
        "http://tratu.coviet.vn/tu-dien-lac-viet.aspx?learn=hoc-tieng-anh&t=V-A&k={}";
    static LACVIET_URL_VN_FR =
        "http://tratu.coviet.vn/tu-dien-lac-viet.aspx?learn=hoc-tieng-phap&t=V-F&k={}";
    static LACVIET_URL_VN_VN =
        "http://tratu.coviet.vn/tu-dien-lac-viet.aspx?learn=hoc-tieng-phap&t=V-V&k={}";
    static LACVIET_URL_EN_VN =
        "http://tratu.coviet.vn/tu-dien-lac-viet.aspx?learn=hoc-tieng-anh&t=A-V&k={}";
    static LACVIET_URL_FR_VN =
        "http://tratu.coviet.vn/tu-dien-lac-viet.aspx?learn=hoc-tieng-phap&t=F-V&k={}";

    // CAMBRIDGE
    static CAMBRIDGE_SPELLING_WRONG = "Did you spell it correctly?";
    static CAMBRIDGE_URL_EN_CN_TD =
        "https://dictionary.cambridge.org/search/english-chinese-traditional/direct/?q={}";
    static CAMBRIDGE_URL_EN_CN_SP =
        "https://dictionary.cambridge.org/search/english-chinese-simplified/direct/?q={}";
    static CAMBRIDGE_URL_EN_FR =
        "https://dictionary.cambridge.org/search/english-french/direct/?q={}";
    static CAMBRIDGE_URL_EN_JP =
        "https://dictionary.cambridge.org/search/english-japanese/direct/?q={}";

    // COLLINS
    static COLLINS_SPELLING_WRONG = "Sorry, no results for";
    static COLLINS_URL_FR_EN =
        "https://www.collinsdictionary.com/search/?dictCode=french-english&q={}";

    // KANTAN
    static KANTAN_URL_VN_JP_OR_JP_VN = "https://kantan.vn/postrequest.ashx";

    // JISHO
    static JISHO_WORD_NOT_FOUND = "Sorry, couldn't find anything matching";
    static JISHO_WORD_URL_JP_EN = "https://jisho.org/word/{}";
    static JISHO_SEARCH_URL_JP_EN = "https://jisho.org/search/{}";

    // WORD REFERENCE
    static WORD_REFERENCE_SPELLING_WRONG = "";
    static WORD_REFERENCE_URL_EN_SP = "";
    static WORD_REFERENCE_URL_SP_EN = "";

    // CONSTANTS
    static TAB = "\t";
    static MAIN_DELIMITER = "\\*\\*\\*";
    static SUB_DELIMITER = "===";
    static NO_EXAMPLE = "No example {{c1::...}}";
    static SUCCESS = "Success";
    static COPYRIGHT =
        "This card's content is collected from the following dictionaries: {}";
    static WORD_NOT_FOUND =
        "Word not found. Could you please check spelling or feedback to us!";
    static CONNECTION_FAILED =
        "Cannot connect to dictionaries, please try again later!";
    static NOT_SUPPORTED_TRANSLATION =
        "The translation from {} to {} is not supported!";

    // LANGUAGES
    static ENGLISH = "english";
    static FRENCH = "french";
    static VIETNAMESE = "vietnamese";
    static CHINESE = "chinese";
    static CHINESE_TD = "chineseTd";
    static CHINESE_SP = "chineseSp";
    static JAPANESE = "japanese";
    static SPANISH = "spanish";

    // TRANSLATION
    static EN_EN = new Translation(Constant.ENGLISH, Constant.ENGLISH);
    static EN_VN = new Translation(Constant.ENGLISH, Constant.VIETNAMESE);
    static EN_CN_TD = new Translation(Constant.ENGLISH, Constant.CHINESE_TD);
    static EN_CN_SP = new Translation(Constant.ENGLISH, Constant.CHINESE_SP);
    static EN_FR = new Translation(Constant.ENGLISH, Constant.FRENCH);
    static EN_JP = new Translation(Constant.ENGLISH, Constant.JAPANESE);

    static VN_EN = new Translation(Constant.VIETNAMESE, Constant.ENGLISH);
    static VN_FR = new Translation(Constant.VIETNAMESE, Constant.FRENCH);
    static VN_JP = new Translation(Constant.VIETNAMESE, Constant.JAPANESE);
    static VN_VN = new Translation(Constant.VIETNAMESE, Constant.VIETNAMESE);

    static FR_VN = new Translation(Constant.FRENCH, Constant.VIETNAMESE);
    static FR_EN = new Translation(Constant.FRENCH, Constant.ENGLISH);

    static JP_EN = new Translation(Constant.JAPANESE, Constant.ENGLISH);
    static JP_VN = new Translation(Constant.JAPANESE, Constant.VIETNAMESE);

    // AnkiFlash fields for mapping content
    static ANKI_FLASH_FIELDS = [
        "Word",
        "WordType",
        "Phonetic",
        "Example",
        "Sound",
        "Image",
        "Meaning",
        "Copyright",
    ];

    // All supported languages
    static SUPPORTED_TRANSLATIONS = {
        ENGLISH: [
            Constant.ENGLISH,
            Constant.VIETNAMESE,
            Constant.CHINESE_TD,
            Constant.CHINESE_SP,
            Constant.FRENCH,
            Constant.JAPANESE,
        ],
        VIETNAMESE: [
            Constant.ENGLISH,
            Constant.FRENCH,
            Constant.JAPANESE,
            Constant.VIETNAMESE,
        ],
        FRENCH: [Constant.ENGLISH, Constant.VIETNAMESE],
        JAPANESE: [Constant.ENGLISH, Constant.VIETNAMESE],
    };
}
