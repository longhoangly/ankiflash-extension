import { Common } from "../../base/common.js";
import { Constant } from "../../base/constant.js";
import { Flash } from "../helper/flash.js";

export class Oxford {
    cardInputDto;

    constructor(cardInputDto) {
        this.cardInputDto = cardInputDto;
    }

    async standardizedWords() {
        Common.logWarn("standardizedWords", Oxford.name);

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
        await this.#getOxfordDocument();

        let wordTypes = $(this.cardInputDto.oxfordDocument).find("span.pos");
        wordTypes = `(${$(wordTypes[0].outerHTML).text()})`;

        Common.logWarn("wordTypes", wordTypes);
        return wordTypes;
    }

    async getPhonetics() {
        Common.logWarn(
            `getPhonetics ${this.cardInputDto.dictionaries.phoneticsDict}`
        );
        await this.#getOxfordDocument();

        let phonetics = $(this.cardInputDto.oxfordDocument).find("span.phon");
        phonetics = `${$(phonetics[0].outerHTML).text()} ${$(
            phonetics[1].outerHTML
        ).text()}`;

        Common.logWarn("phonetics", phonetics);
        return phonetics;
    }

    async getExamples(count = 5) {
        Common.logWarn(
            `getExamples ${this.cardInputDto.dictionaries.examplesDict}`
        );
        await this.#getOxfordDocument();

        let exampleTags = $(this.cardInputDto.oxfordDocument).find("span.x");
        exampleTags = exampleTags.slice(0, count);

        let examples = [];
        for (const exampleTag of exampleTags) {
            examples.push($(exampleTag.outerHTML).text());
        }

        if (examples.length === 0) {
            return Constant.NO_EXAMPLE;
        }

        let word = this.cardInputDto.standardizedWord.word;
        for (let i = 0; i < examples.length; i++) {
            if (examples[i].includes(word)) {
                examples[i] = examples[i].replaceAll(word, `{{c1::${word}}}`);
            } else {
                examples[i] = "{} {}".format(examples[i], "{{c1::...}}");
            }
        }

        return await Flash.buildExamples(examples);
    }

    async getSounds() {
        Common.logWarn(
            `getSounds ${this.cardInputDto.dictionaries.soundsDict}`
        );
        await this.#getOxfordDocument();

        let soundLinks = [];
        for (const selector of ["div.pron-uk", "div.pron-us"]) {
            let [soundTag] = $(this.cardInputDto.oxfordDocument).find(selector);
            soundLinks.push($(soundTag.outerHTML).attr("data-src-mp3"));
        }

        Common.logWarn("soundLinks", soundLinks);
        if (!this.cardInputDto.isOnline) {
            await Flash.downloadFiles(soundLinks);
        }

        let sounds = [];
        for (let sound of soundLinks) {
            if (!this.cardInputDto.isOnline) {
                sound = sound.split("/").pop();
            }

            sounds.push(
                '<audio src="{}" type="audio/wav" preload="auto" autobuffer controls>[sound:{}]</audio>'.format(
                    sound,
                    sound
                )
            );
        }

        return sounds.join(" ");
    }

    async getImages() {
        Common.logWarn(
            `getImages ${this.cardInputDto.dictionaries.imagesDict}`
        );
        await this.#getOxfordDocument();

        let [imageTag] = $(this.cardInputDto.oxfordDocument).find("a.topic");
        if (imageTag) {
            let imageLink = $(imageTag.outerHTML).attr("href");

            let image = imageLink;
            Common.logWarn("imageLink", imageLink);

            if (!this.cardInputDto.isOnline) {
                await Flash.downloadFiles([imageLink]);
                image = imageLink.split("/").pop();
            }

            image = '<img src="' + image + '"/>';
            return image;
        } else {
            return '<a href="https://www.google.com/search?biw=1280&bih=661&tbm=isch&sa=1&q={}" style="font-size: 15px; color: blue">Search Images</a>'.format(
                this.cardInputDto.standardizedWord.wordOri
            );
        }
    }

    async getMeaning() {
        Common.logWarn(
            `getMeaning ${this.cardInputDto.dictionaries.meaningDict}`
        );
        await this.#getOxfordDocument();

        let [contentTag] = $(this.cardInputDto.oxfordDocument).find(
            "#entryContent"
        );

        let entryContent = $(contentTag.outerHTML).prop("outerHTML");
        entryContent = entryContent.replaceAll("\n", "").replaceAll("\r", "");
        entryContent =
            `<link rel="stylesheet" href="https://www.oxfordlearnersdictionaries.com/external/styles/responsive.css?version=2.3.60" />` +
            entryContent;
        Common.logWarn("meaning", entryContent.slice(0, 1000));

        return entryContent;
    }

    async #getOxfordDocument() {
        if (!this.cardInputDto.oxfordDocument) {
            this.cardInputDto.oxfordDocument = await Common.fetchNeutral({
                method: "GET",
                respType: Common.RESP_TYPE_ENUM.TEXT,
                url: Constant.OX_EN_EN_SEARCH_URL.format(
                    this.cardInputDto.standardizedWord.wordId
                ),
            });
        }
    }
}
