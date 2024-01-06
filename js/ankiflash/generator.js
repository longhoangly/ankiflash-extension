import { Common } from "../base/common.js";
import { Constant } from "../base/constant.js";
import { Card } from "./dto/card.js";
import { Status } from "./dto/status.js";

export class Generator {
    translation;

    constructor() {
        if (new.target === Generator) {
            throw new TypeError(
                `Cannot construct ${Generator.name} instances directly. It's abstract class.`
            );
        }
    }

    async formatInputs(_word, _allWordTypes) {
        throw new Error("NotImplementedError");
    }

    async generateCard(_formattedWord, _mediaDir, _isOnline) {
        throw new Error("NotImplementedError");
    }

    async generateCards(words, allWordTypes, isOnline) {
        Common.logWarning(
            "Creating flashcards...",
            this.translation,
            words,
            allWordTypes,
            isOnline
        );

        // more logics to call generateCard...
        await this.generateCard("", "", true);
    }

    async updateResults(genResult) {
        Common.logWarning("genResult", genResult);
    }

    async initializeCard(formattedWord) {
        let card = new Card(this.translation);
        let wordParts = formattedWord.split(Constant.SUB_DELIMITER);

        if (
            formattedWord.includes(Constant.SUB_DELIMITER) &&
            wordParts.length === 3
        ) {
            card.status = Status.SUCCESS;
            card.comment = Constant.SUCCESS;
        } else {
            throw new Error(
                "Incorrect formattedWord: {}".format(formattedWord)
            );
        }

        Common.logInfo("transation", this.translation);

        return card;
    }

    async singleDictionaryCard(formattedWord, mediaDir, isOnline, dictionary) {
        let card = this.initializeCard(formattedWord);

        if (dictionary.search(formattedWord, translation)) {
            card.status = Status.CONNECTION_FAILED;
            card.comment = Constant.CONNECTION_FAILED;
            return card;
        } else if (dictionary.is_invalid_word()) {
            dictionary.word;
            card.status = Status.WORD_NOT_FOUND;
            card.comment = Constant.WORD_NOT_FOUND;
            return card;
        }

        card.wordType = dictionary.get_word_type();
        card.phonetic = dictionary.get_phonetic();
        card.example = dictionary.get_example();

        card.sounds = dictionary.get_sounds(mediaDir, isOnline);
        card.image = dictionary.get_image(mediaDir, isOnline);

        card.copyright = Constant.COPYRIGHT.format(
            dictionary.get_dictionary_name()
        );
        card.meaning = dictionary.get_meaning();

        card = dictionary.set_card_word(card);
        card.tag = dictionary.get_tag();

        return card;
    }

    // def multiple_dictionaries_card(
    //     self,
    //     formattedWord: str,
    //     translation: Translation,
    //     mediaDir: str,
    //     isOnline: bool,
    //     mainDict: BaseDictionary,
    //     meaningDict: BaseDictionary,
    // ) -> Card:

    //     card = self.initialize_card(formattedWord, translation)

    //     if mainDict.search(formattedWord, translation) or meaningDict.search(
    //         formattedWord, translation
    //     ):
    //         card.status = Status.CONNECTION_FAILED
    //         card.comment = Constant.CONNECTION_FAILED
    //         return card
    //     elif mainDict.is_invalid_word() or meaningDict.is_invalid_word():
    //         card.status = Status.WORD_NOT_FOUND
    //         card.comment = Constant.WORD_NOT_FOUND
    //         return card

    //     if translation.equals(Constant.EN_VN) or translation.equals(Constant.EN_FR):
    //         card.wordType = meaningDict.get_word_type()
    //     else:
    //         card.wordType = mainDict.get_word_type()

    //     card.phonetic = mainDict.get_phonetic()
    //     card.example = mainDict.get_example()

    //     card.sounds = mainDict.get_sounds(mediaDir, isOnline)
    //     card.image = mainDict.get_image(mediaDir, isOnline)

    //     card.copyright = Constant.COPYRIGHT.format(
    //         "{}, and {}".format(
    //             mainDict.get_dictionary_name(), meaningDict.get_dictionary_name()
    //         )
    //     )
    //     # Meaning is get from meaningDict
    //     card.meaning = meaningDict.get_meaning()

    //     card = mainDict.set_card_word(card)
    //     card.tag = mainDict.get_tag()

    //     return card
}
