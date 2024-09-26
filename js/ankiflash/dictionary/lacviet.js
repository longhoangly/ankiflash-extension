import { Common } from "../../base/common.js";
import { Constant } from "../../base/constant.js";
import { Dictionary } from "../dictionary.js";
import { Translation } from "../dto/translation.js";

export class LacViet extends Dictionary {
    constructor(genInputDto) {
        super(genInputDto);
    }

    async getWordTypes(cardInputDto) {
        Common.logWarn(`[getWordTypes] ${LacViet.name}`, cardInputDto);

        let lvDocument = await this.#getLacVietDocument();
        Common.logWarn("lvDocument", lvDocument);

        return lvDocument;
    }

    async getPhonetics(cardInputDto) {
        Common.logWarn(`[getPhonetics] ${LacViet.name}`, cardInputDto);
    }

    async getExamples(cardInputDto, count = 5) {
        Common.logWarn(`[getExamples] ${LacViet.name}`, cardInputDto);
    }

    async getSounds(cardInputDto) {
        Common.logWarn(`[getSounds] ${LacViet.name}`, cardInputDto);
    }

    async getImages(cardInputDto) {
        Common.logWarn(`[getImages] ${LacViet.name}`, cardInputDto);
    }

    async getMeaning(cardInputDto) {
        Common.logWarn(`[getMeaning] ${LacViet.name}`, cardInputDto);
    }

    async #getLacVietDocument(cardInputDto) {
        let [
            standardizedWord,
        ] = this.genInputDto.standardizedWords.filter((w) =>
            Common.compareTwoJsonObjects(cardInputDto.standardizedWord, w)
        );

        if (standardizedWord.lacVietDocument) {
            return standardizedWord.lacVietDocument;
        }

        let payload =
            "dict={}\r\nword={}\r\namount=12\r\ndong=Đóng\r\nshowinlang=1";
        if (
            cardInputDto.translation.equals(
                new Translation(Constant.VIETNAMESE, Constant.ENGLISH)
            )
        ) {
            payload = payload.format(
                "V-A",
                cardInputDto.standardizedWord.wordId
            );
        } else if (
            cardInputDto.translation.equals(
                new Translation(Constant.VIETNAMESE, Constant.FRENCH)
            )
        ) {
            payload = payload.format(
                "V-F",
                cardInputDto.standardizedWord.wordId
            );
        } else if (
            cardInputDto.translation.equals(
                new Translation(Constant.VIETNAMESE, Constant.VIETNAMESE)
            )
        ) {
            payload = payload.format(
                "V-V",
                cardInputDto.standardizedWord.wordId
            );
        } else if (
            cardInputDto.translation.equals(
                new Translation(Constant.ENGLISH, Constant.VIETNAMESE)
            )
        ) {
            payload = payload.format(
                "A-V",
                cardInputDto.standardizedWord.wordId
            );
        } else if (
            cardInputDto.translation.equals(
                new Translation(Constant.FRENCH, Constant.VIETNAMESE)
            )
        ) {
            payload = payload.format(
                "F-V",
                cardInputDto.standardizedWord.wordId
            );
        }

        standardizedWord.lacVietDocument = await Common.fetchNeutral({
            method: "GET",
            respType: Common.RESP_TYPE_ENUM.TEXT,
            url: Constant.LV_SEARCH_URL,
            headers: {
                "Content-Type": "text/plain;charset=UTF-8",
            },
        });

        return standardizedWord.lacVietDocument;
    }

    async #getLacVietCss() {
        if (this.genInputDto.lacVietCss) {
            return this.genInputDto.lacVietCss;
        }

        let urlContent = await Common.getUrlContent("xxx");

        this.genInputDto.lacVietCss = urlContent
            .replaceAll("\n", " ")
            .replaceAll("\r", " ")
            .replaceAll("\t", " ");

        return this.genInputDto.lacVietCss;
    }
}
