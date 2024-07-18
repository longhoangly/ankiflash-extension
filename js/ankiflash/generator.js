import { Common } from "../base/common.js";
import { Constant } from "../base/constant.js";
import { Dictionary } from "./dictionary.js";
import { Card } from "./dto/card.js";
import { Flash } from "./helper/flash.js";

export class Generator {
    genInputDto;

    constructor(genInputDto) {
        this.genInputDto = genInputDto;
    }

    async generateCards() {
        let dictionary = new Dictionary(this.genInputDto);
        this.genInputDto.standardizedWords =
            await dictionary.standardizedWords();

        let outputCards = [];
        for (const standardizedWord of this.genInputDto.standardizedWords) {
            let cardInputDto = await Flash.convertGenToCardDto(
                this.genInputDto,
                standardizedWord
            );

            outputCards.push(
                await this.#generateCard(dictionary, cardInputDto)
            );
        }

        await this.#generateCsv(outputCards);
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

            let currentOutput = (await Common.getStorage("outputTxt")) || "";
            await Common.setFieldValue(
                "outputTxt",
                card.meaning + "\n" + currentOutput,
                true
            );
        } catch (err) {
            Common.logError("Error appeared...", err);

            card.status = "FAILED";
            card.errorMessage = `${cardInputDto.standardizedWord.word} - failed to create flash card!`;

            let currentFailure = (await Common.getStorage("failureTxt")) || "";
            await Common.setFieldValue(
                "failureTxt",
                card.errorMessage + "\n" + currentFailure,
                true
            );
        }

        return card;
    }

    async #generateCsv(cards) {
        let cardLines = [];
        let mappingLines = [];

        for (const card of cards) {
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

        var deckBlob = new Blob(cardLines, {
            type: "text/plain",
        });
        var deckUrl = URL.createObjectURL(deckBlob);
        await Flash.downloadFiles([deckUrl], `AnkiFlash/${Constant.ANKI_DECK}`);

        let mappingBlob = new Blob(mappingLines, {
            type: "text/plain",
        });
        let mappingUrl = URL.createObjectURL(mappingBlob);
        await Flash.downloadFiles(
            [mappingUrl],
            `AnkiFlash/${Constant.MAPPING_CSV}`
        );
    }
}
