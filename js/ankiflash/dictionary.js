export class Dictionary {
    name;
    document;
    translation;

    word;
    wordId;
    oriWord;

    ankiDir;
    image;
    sounds;

    wordType;
    phonetic;

    constructor() {
        if (new.target === Dictionary) {
            throw new TypeError(
                `Cannot construct ${Dictionary.name} instances directly. It's abstract class.`
            );
        }
    }

    async search(_formattedWord) {
        throw new Error("NotImplementedError");
    }

    async isInvalidWord() {
        throw new Error("NotImplementedError");
    }

    async getWordTypes() {
        throw new Error("NotImplementedError");
    }

    async getExamples() {
        throw new Error("NotImplementedError");
    }

    async getPhonetics() {
        throw new Error("NotImplementedError");
    }

    async getImages(ankiDir, isOnline) {
        throw new Error("NotImplementedError");
    }

    async getSounds(ankiDir, isOnline) {
        throw new Error("NotImplementedError");
    }

    async get_meaning() {
        throw new Error("NotImplementedError");
    }

    async getTag() {
        return word[0];
    }

    async setCardWord(card) {
        card.word = word;
        card.wordId = wordId;
        card.oriWord = oriWord;

        logging.info("card.word = {}".format(card.word));
        logging.info("card.wordId = {}".format(card.wordId));
        logging.info("card.oriWord = {}".format(card.oriWord));

        return card;
    }

    async getDictionaryName() {
        throw new Error("NotImplementedError");
    }
}
