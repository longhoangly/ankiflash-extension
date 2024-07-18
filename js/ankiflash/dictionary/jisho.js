import { Common } from "../../base/common.js";
import { Constant } from "../../base/constant.js";

export class Jisho {
    cardInputDto;

    constructor(cardInputDto) {
        this.cardInputDto = cardInputDto;
    }

    async standardizedWords() {
        Common.logWarn("standardizedWords", Jisho.name);

        let standardizedWords = [];
        standardizedWords.push({
            word: this.cardInputDto.word,
            wordId: this.cardInputDto.word,
            wordOri: this.cardInputDto.word,
        });

        return standardizedWords;
    }

    async getWordTypes() {
        Common.logWarn(
            `getWordTypes ${this.cardInputDto.dictionaries.wordTypesDict}`
        );
    }

    async getPhonetics() {
        Common.logWarn(
            `getPhonetics ${this.cardInputDto.dictionaries.phoneticsDict}`
        );
    }

    async getExamples() {
        Common.logWarn(
            `getExamples ${this.cardInputDto.dictionaries.examplesDict}`
        );
    }

    async getSounds() {
        Common.logWarn(
            `getSounds ${this.cardInputDto.dictionaries.soundsDict}`
        );
    }

    async getImages() {
        Common.logWarn(
            `getImages ${this.cardInputDto.dictionaries.imagesDict}`
        );
    }

    async getMeaning() {
        Common.logWarn(
            `getMeaning ${this.cardInputDto.dictionaries.meaningDict}`
        );
    }
}
