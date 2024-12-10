import { Common } from "../base/common.js";
import { Constant } from "../base/constant.js";
import { Card } from "./dto/card.js";
import { Flash } from "./helper/flash.js";
import { Oxford } from "./dictionary/oxford.js";
import { Cambridge } from "./dictionary/cambridge.js";
import { Collins } from "./dictionary/collins.js";
import { Jisho } from "./dictionary/jisho.js";
import { Kantan } from "./dictionary/kantan.js";
import { LacViet } from "./dictionary/lacviet.js";
import { Wiktionary } from "./dictionary/Wiktionary.js";

export class Generator {
    genInputDto;

    constructor(genInputDto) {
        this.genInputDto = genInputDto;
    }

    async generateCards() {
        for (const fieldId of ["outputTxt", "failureTxt"]) {
            await Common.setFieldValue(fieldId, "");
        }

        const dictionary = Generator.#getDictInstance(this.genInputDto);
        this.genInputDto.standardizedWords = await dictionary.standardizedWords();
        Common.logInfo("standardizedWords", this.genInputDto.standardizedWords);

        let outputCards = [];
        for (const stdWord of this.genInputDto.standardizedWords) {
            const cardInputDto = await Flash.convertGenToCardDto(
                this.genInputDto,
                stdWord
            );

            outputCards.push(
                await this.#generateCard(dictionary, cardInputDto)
            );
            await this.#calculateProgress(outputCards);

            if (await Common.getTabStorage("isCanceled")) {
                await Common.setTabStorage("isCanceled", false);
                break;
            }
        }

        return outputCards;
    }

    async #generateCard(dictionary, cardInputDto) {
        let card = new Card(cardInputDto);

        try {
            card.wordTypes = await dictionary.getWordTypes(cardInputDto);
            card.phonetics = await dictionary.getPhonetics(cardInputDto);
            card.examples = await dictionary.getExamples(cardInputDto);
            card.sounds = await dictionary.getSounds(cardInputDto);
            card.images = await dictionary.getImages(cardInputDto);
            card.meaning = await dictionary.getMeaning(cardInputDto);
            card.copyright = await dictionary.getCopyright(cardInputDto);
            card.tag = await dictionary.getTag(cardInputDto);
            card.status = "SUCCESS";

            const currentOutput =
                (await Common.getTabStorage("outputTxt")) || "";
            await Common.setFieldValue(
                "outputTxt",
                card.meaning + "\n" + currentOutput
            );
        } catch (err) {
            Common.logError("Error appeared...", err);

            card.status = "FAILED";
            card.errorMessage = `${cardInputDto.standardizedWord.word} - failed to create flash card!`;

            const currentFailure =
                (await Common.getTabStorage("failureTxt")) || "";
            await Common.setFieldValue(
                "failureTxt",
                card.errorMessage + "\n" + currentFailure
            );
        }

        return card;
    }

    async #calculateProgress(cards) {
        const percentage = parseInt(
            (cards.length / this.genInputDto.standardizedWords.length) * 100
        );

        $("#progressbar").text(`${percentage}%`);
        $("#progressbar").attr("style", `width: ${percentage}%`);
    }

    async generateCsv(cards) {
        let cardLines = [];
        let mappingLines = [];

        for (const card of cards.filter((c) => c.status === "SUCCESS")) {
            cardLines.push([
                "{}{}{}{}{}{}{}{}{}{}{}{}{}{}{}{}{}".format(
                    card.cardInputDto.standardizedWord.word,
                    "\t",
                    card.wordTypes,
                    "\t",
                    card.phonetics,
                    "\t",
                    card.examples,
                    "\t",
                    card.sounds,
                    "\t",
                    card.images,
                    "\t",
                    card.meaning,
                    "\t",
                    card.copyright,
                    "\t",
                    card.tag + "\n"
                ),
            ]);

            mappingLines.push([
                "{}{}{}{}{}{}{}{}{}{}{}{}{}{}{}".format(
                    card.cardInputDto.standardizedWord.wordOri,
                    "\t",
                    card.wordTypes,
                    "\t",
                    card.phonetics,
                    "\t",
                    card.examples,
                    "\t",
                    card.sounds,
                    "\t",
                    card.images,
                    "\t",
                    card.meaning,
                    "\t",
                    card.copyright + "\n"
                ),
            ]);
        }

        const deckUrl = URL.createObjectURL(
            new Blob(cardLines, {
                type: "text/csv",
            })
        );
        await Common.chromeDownloadFiles(
            [deckUrl],
            Constant.ANKI_DECK
            // `${chrome.runtime.id}/${Constant.ANKI_DECK}`
        );

        const mappingUrl = URL.createObjectURL(
            new Blob(mappingLines, {
                type: "text/csv",
            })
        );
        await Common.chromeDownloadFiles(
            [mappingUrl],
            Constant.MAPPING_CSV
            // `${chrome.runtime.id}/${Constant.MAPPING_CSV}`
        );
    }

    static #getDictInstance(genInputDto) {
        let dict;

        switch (genInputDto.mainDict) {
            case Constant.CAMBRIDGE:
                dict = new Cambridge(genInputDto);
                break;
            case Constant.OXFORD:
                dict = new Oxford(genInputDto);
                break;
            case Constant.COLLINS:
                dict = new Collins(genInputDto);
                break;
            case Constant.JISHO:
                dict = new Jisho(genInputDto);
                break;
            case Constant.KANTAN:
                dict = new Kantan(genInputDto);
                break;
            case Constant.LACVIET:
                dict = new LacViet(genInputDto);
                break;
            case Constant.WIKTIONARY:
                dict = new Wiktionary(genInputDto);
                break;
            default:
                throw new Error(`${genInputDto.mainDict} is not supported!`);
        }

        return dict;
    }
}
