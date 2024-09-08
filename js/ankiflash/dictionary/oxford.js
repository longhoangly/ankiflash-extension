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

        let wordTypes = $(await this.#getOxfordDocument()).find("span.pos");
        wordTypes = `(${$(wordTypes[0].outerHTML).text()})`;

        Common.logWarn("wordTypes", wordTypes);
        return wordTypes;
    }

    async getPhonetics() {
        Common.logWarn(
            `getPhonetics ${this.cardInputDto.dictionaries.phoneticsDict}`
        );

        let phonetics = $(await this.#getOxfordDocument()).find("span.phon");
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

        let exampleTags = $(await this.#getOxfordDocument()).find("span.x");
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

        let soundLinks = [];
        for (const selector of ["div.pron-uk", "div.pron-us"]) {
            let [soundTag] = $(await this.#getOxfordDocument()).find(selector);
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

        let [imageTag] = $(await this.#getOxfordDocument()).find("a.topic");
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

        let [sense] = $(await this.#getOxfordDocument()).find(
            "ol.senses_multiple"
        );

        let meaning = sense.outerHTML
            .replaceAll("\n", " ")
            .replaceAll("\r", " ")
            .replaceAll("\t", " ");
        meaning = meaning.replaceAll("unbox", "unbox is-active");
        meaning = meaning.replaceAll(
            '"ring-links-box"',
            '"ring-links-box" style="display: none;"'
        );

        return `<div class="content-container"> ${meaning} </div> <style> ${await this.#getOxfordCss()} </style>`;
    }

    async #getOxfordDocument() {
        if (this.cardInputDto.oxfordDocument) {
            return this.cardInputDto.oxfordDocument;
        }

        this.cardInputDto.oxfordDocument = await Common.fetchNeutral({
            method: "GET",
            respType: Common.RESP_TYPE_ENUM.TEXT,
            url: Constant.OX_EN_EN_URL.format(
                this.cardInputDto.standardizedWord.wordId
            ),
        });

        return this.cardInputDto.oxfordDocument;
    }

    async #getOxfordCss() {
        if (this.cardInputDto.oxfordCss) {
            return this.cardInputDto.oxfordCss;
        }

        let urlContent = await Common.getUrlContent(
            `${Constant.OX_BASE_URL}/external/styles/oald10.css?version=2.3.61`
        );

        let oxfordCss = urlContent
            .replaceAll("\n", " ")
            .replaceAll("\r", " ")
            .replaceAll("\t", " ");

        oxfordCss = oxfordCss.replaceAll(/6f6f6f/gi, "1da8af");
        oxfordCss = oxfordCss.replaceAll(/1a3561/gi, "1da8af");
        oxfordCss = oxfordCss.replaceAll(/333333/gi, "1da8af");
        oxfordCss = oxfordCss.replaceAll(/0069b4/gi, "1da8af");
        oxfordCss = oxfordCss.replaceAll(/faded7/gi, "36454f");

        oxfordCss = oxfordCss.replaceAll(/#fdf3f0/gi, "inherit");
        oxfordCss = oxfordCss.replaceAll(
            "../images",
            "https://www.oxfordlearnersdictionaries.com/external/images"
        );

        oxfordCss = oxfordCss.replaceAll(
            "div.collapse .body .unbox:first-of-type",
            "div.collapse .body .unbox"
        );

        this.cardInputDto.oxfordCss = oxfordCss;
        return oxfordCss;
    }
}
