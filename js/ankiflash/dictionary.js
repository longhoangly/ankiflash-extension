import { Constant } from "../base/constant.js";
import { Wiktionary } from "./dictionary/Wiktionary.js";
import { Cambridge } from "./dictionary/cambridge.js";
import { Collins } from "./dictionary/collins.js";
import { Jisho } from "./dictionary/jisho.js";
import { Kantan } from "./dictionary/kantan.js";
import { LacViet } from "./dictionary/lacviet.js";
import { Oxford } from "./dictionary/oxford.js";
import { Translation } from "./dto/translation.js";
import { Flash } from "./helper/flash.js";

export class Dictionary {
    genInputDto;

    constructor(genInputDto) {
        this.genInputDto = genInputDto;
    }

    async standardizedWords() {
        let standardizedWords = [];

        for (const word of this.genInputDto.words) {
            if (this.genInputDto.relatedWords) {
                let cardInputDto = await Flash.convertGenToCardDto(
                    this.genInputDto,
                    word
                );

                if (
                    this.genInputDto.translation.belongTo([
                        new Translation(Constant.JAPANESE, Constant.VIETNAMESE),
                        new Translation(Constant.VIETNAMESE, Constant.JAPANESE),
                    ])
                ) {
                    let kantan = new Kantan(cardInputDto);
                    standardizedWords = standardizedWords.concat(
                        await kantan.standardizedWords()
                    );
                } else if (
                    this.genInputDto.translation.equals(
                        new Translation(Constant.ENGLISH, Constant.ENGLISH)
                    )
                ) {
                    let oxford = new Oxford(cardInputDto);
                    standardizedWords = standardizedWords.concat(
                        await oxford.standardizedWords()
                    );
                } else if (
                    this.genInputDto.translation.equals(
                        new Translation(Constant.JAPANESE, Constant.ENGLISH)
                    )
                ) {
                    let jisho = new Jisho(cardInputDto);
                    standardizedWords = standardizedWords.concat(
                        await jisho.standardizedWords()
                    );
                } else if (
                    this.genInputDto.translation.equals(
                        new Translation(
                            Constant.VIETNAMESE,
                            Constant.VIETNAMESE
                        )
                    )
                ) {
                    let wiktionary = new Wiktionary(cardInputDto);
                    standardizedWords = standardizedWords.concat(
                        await wiktionary.standardizedWords()
                    );
                }
            } else {
                standardizedWords.push({
                    word: word,
                    wordId: word,
                    wordOri: word,
                });
            }
        }
        return standardizedWords;
    }

    async getWordTypes(cardInputDto) {
        let dict = await this.getDictInstance(
            this.genInputDto.dictionaries.wordTypesDict,
            cardInputDto
        );
        return dict.getWordTypes();
    }

    async getPhonetics(cardInputDto) {
        let dict = await this.getDictInstance(
            this.genInputDto.dictionaries.phoneticsDict,
            cardInputDto
        );
        return dict.getPhonetics();
    }

    async getExamples(cardInputDto) {
        let dict = await this.getDictInstance(
            this.genInputDto.dictionaries.examplesDict,
            cardInputDto
        );
        return dict.getExamples();
    }

    async getSounds(cardInputDto) {
        let dict = await this.getDictInstance(
            this.genInputDto.dictionaries.soundsDict,
            cardInputDto
        );
        return dict.getSounds();
    }

    async getImages(cardInputDto) {
        let dict = await this.getDictInstance(
            this.genInputDto.dictionaries.imagesDict,
            cardInputDto
        );
        return dict.getImages();
    }

    async getMeaning(cardInputDto) {
        let dict = await this.getDictInstance(
            this.genInputDto.dictionaries.meaningDict,
            cardInputDto
        );
        return dict.getMeaning();
    }

    async getCopyright(cardInputDto) {
        return `The content of this card is get from the following dictionaries: ${cardInputDto.dictionaries.combinedDicts.join(
            ", "
        )}`;
    }

    async getTag(cardInputDto) {
        return cardInputDto.standardizedWord.word[0];
    }

    async getDictInstance(dictName, cardInputDto) {
        let dict;

        switch (dictName) {
            case Constant.CAMBRIDGE:
                dict = new Cambridge(cardInputDto);
                break;
            case Constant.COLLINS:
                dict = new Collins(cardInputDto);
                break;
            case Constant.JISHO:
                dict = new Jisho(cardInputDto);
                break;
            case Constant.KANTAN:
                dict = new Kantan(cardInputDto);
                break;
            case Constant.LACVIET:
                dict = new LacViet(cardInputDto);
                break;
            case Constant.WIKTIONARY:
                dict = new Wiktionary(cardInputDto);
                break;
            default:
                dict = new Oxford(cardInputDto);
                break;
        }

        return dict;
    }
}
