import { Common } from "../../base/common.js";
import { Constant } from "../../base/constant.js";
import { Dictionary } from "../dictionary.js";
import { Translation } from "../dto/translation.js";

export class LacViet extends Dictionary {
    constructor(genInputDto) {
        super(genInputDto);
    }

    async standardizedWords() {
        Common.logWarn(`[standardizedWords] ${LacViet.name}`);

        let standardizedWords = [];
        for (const word of this.genInputDto.words) {
            standardizedWords = standardizedWords.concat(
                await this.#getStandardizedWords(word)
            );
        }
        return standardizedWords;
    }

    async getWordTypes(cardInputDto) {
        Common.logWarn(`[getWordTypes] ${LacViet.name}`, cardInputDto);
        const lvDocument = await this.#getDocument(cardInputDto);
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

    async #getStandardizedWords(word) {
        let payload = {
            word: word,
            amount: 12,
            dong: "Đóng",
            showinlang: 1,
        };

        if (
            new Translation(Constant.VIETNAMESE, Constant.ENGLISH).equals(
                this.genInputDto.translation
            )
        ) {
            payload.dict = "V-A";
        } else if (
            new Translation(Constant.VIETNAMESE, Constant.FRENCH).equals(
                this.genInputDto.translation
            )
        ) {
            payload.dict = "V-F";
        } else if (
            new Translation(Constant.VIETNAMESE, Constant.VIETNAMESE).equals(
                this.genInputDto.translation
            )
        ) {
            payload.dict = "V-V";
        } else if (
            new Translation(Constant.ENGLISH, Constant.VIETNAMESE).equals(
                this.genInputDto.translation
            )
        ) {
            payload.dict = "A-V";
        } else if (
            new Translation(Constant.FRENCH, Constant.VIETNAMESE).equals(
                this.genInputDto.translation
            )
        ) {
            payload.dict = "F-V";
        }

        const params = Object.keys(payload)
            .map((key) => {
                return `${key}=${payload[key]}`;
            })
            .join("\r\n");

        let html = await Common.fetchNeutral({
            headers: {
                "Content-Type": "text/plain;charset=UTF-8",
            },
            method: "POST",
            payload: params,
            respType: Common.RESP_TYPE_ENUM.TEXT,
            url: Constant.LV_SEARCH_URL,
        });
        html = html.slice(1);
        html = html.slice(0, -1);

        let standardizedWords = [];
        for (const li of $(html).find("li").prevObject) {
            const liTxt = $(li).text();

            if (
                this.genInputDto.relatedWords
                    ? liTxt.includes(word)
                    : liTxt === word
            ) {
                standardizedWords.push({
                    word: word,
                    wordId: $(li)
                        .attr("onclick")
                        .replaceAll("\\'location.href=\"", "")
                        .replaceAll("\"\\'", ""),
                    wordOri: word,
                });
            }
        }

        return standardizedWords;
    }

    async #getDocument(cardInputDto) {
        Common.logInfo(
            "Getting LacViet document from URL = '{}'".format(
                cardInputDto.standardizedWord.wordId
            )
        );

        let [
            standardizedWord,
        ] = this.genInputDto.standardizedWords.filter((w) =>
            Common.compareTwoJsonObjects(cardInputDto.standardizedWord, w)
        );

        if (!standardizedWord.lacVietDocument) {
            standardizedWord.lacVietDocument = await Common.getUrlContent(
                `${Constant.LV_BASE_URL}${standardizedWord.wordId}`
            );
        }

        return standardizedWord.lacVietDocument;
    }
}
