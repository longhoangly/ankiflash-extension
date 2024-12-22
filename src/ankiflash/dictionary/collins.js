import { Common } from "../../base/common.js";
import { Constant } from "../../base/constant.js";
import { Dictionary } from "../dictionary.js";

export class Collins extends Dictionary {
    constructor(genInputDto) {
        super(genInputDto);
    }

    async getWordTypes(cardInputDto) {
        Common.logWarn(`[getWordTypes] ${Collins.name}`, cardInputDto);
    }

    async getPhonetics(cardInputDto) {
        Common.logWarn(`[getPhonetics] ${Collins.name}`, cardInputDto);
    }

    async getExamples(cardInputDto, count = 5) {
        Common.logWarn(`[getExamples] ${Collins.name}`, cardInputDto);
    }

    async getSounds(cardInputDto) {
        Common.logWarn(`[getSounds] ${Collins.name}`, cardInputDto);
    }

    async getImages(cardInputDto) {
        Common.logWarn(`[getImages] ${Collins.name}`, cardInputDto);
    }

    async getMeaning(cardInputDto) {
        Common.logWarn(`[getMeaning] ${Collins.name}`, cardInputDto);
    }

    async #getDocument(cardInputDto) {
        let [
            standardizedWord,
        ] = this.genInputDto.standardizedWords.filter((w) =>
            Common.compareTwoJsonObjects(cardInputDto.standardizedWord, w)
        );

        if (standardizedWord.collinsDocument) {
            return standardizedWord.collinsDocument;
        }

        standardizedWord.collinsDocument = await Common.fetchNeutral({
            method: "GET",
            respType: Common.RESP_TYPE_ENUM.TEXT,
            url: Constant.CL_FR_EN_URL.format(standardizedWord.wordId),
        });

        return standardizedWord.collinsDocument;
    }

    async #getCss() {
        if (this.genInputDto.collinsCss) {
            return this.genInputDto.collinsCss;
        }

        const urlContent = await Common.getUrlContent("xxx");

        this.genInputDto.collinsCss = urlContent
            .replaceAll("\n", " ")
            .replaceAll("\r", " ")
            .replaceAll("\t", " ");

        return this.genInputDto.collinsCss;
    }
}
