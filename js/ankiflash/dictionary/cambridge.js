import { Common } from "../../base/common.js";

export class Cambridge {
    genInputDto;

    constructor(genInputDto) {
        this.genInputDto = genInputDto;
    }

    async getWordTypes(cardInputDto) {
        Common.logWarn(`[getWordTypes] ${Cambridge.name}`);
    }

    async getPhonetics(cardInputDto) {
        Common.logWarn(`[getPhonetics] ${Cambridge.name}`);
    }

    async getExamples(cardInputDto) {
        Common.logWarn(`[getExamples] ${Cambridge.name}`);
    }

    async getSounds(cardInputDto) {
        Common.logWarn(`[getSounds] ${Cambridge.name}`);
    }

    async getImages(cardInputDto) {
        Common.logWarn(`[getImages] ${Cambridge.name}`);
    }

    async getMeaning(cardInputDto) {
        Common.logWarn(`[getMeaning] ${Cambridge.name}`);
    }

    async getCopyright() {
        return `The content of this card is get from the dictionary: ${Cambridge.name}`;
    }
}
