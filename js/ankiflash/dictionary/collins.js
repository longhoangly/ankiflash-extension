export class Collins {
    cardInputDto;

    constructor(cardInputDto) {
        this.cardInputDto = cardInputDto;
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
