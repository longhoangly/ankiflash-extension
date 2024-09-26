import { Common } from "../../base/common.js";
import { Constant } from "../../base/constant.js";
import { Dictionary } from "../dictionary.js";
import { Flash } from "../helper/flash.js";

export class Oxford extends Dictionary {
    constructor(genInputDto) {
        super(genInputDto);
    }

    async standardizedWords() {
        Common.logWarn(`[standardizedWords] ${Oxford.name}`);

        let standardizedWords = [];
        for (const word of this.genInputDto.words) {
            standardizedWords.push({
                word: word,
                wordId: word,
                wordOri: word,
            });
        }
        return standardizedWords;
    }

    async getWordTypes(cardInputDto) {
        Common.logWarn(`[getWordTypes] ${Oxford.name}`, cardInputDto);

        let wordTypes = $(await this.#getOxfordDocument(cardInputDto)).find(
            "span.pos"
        );
        wordTypes = `(${$(wordTypes[0].outerHTML).text()})`;

        Common.logWarn("wordTypes", wordTypes);
        return wordTypes;
    }

    async getPhonetics(cardInputDto) {
        Common.logWarn(`[getPhonetics] ${Oxford.name}`, cardInputDto);

        let phonetics = $(await this.#getOxfordDocument(cardInputDto)).find(
            "span.phon"
        );
        phonetics = `${$(phonetics[0].outerHTML).text()} ${$(
            phonetics[1].outerHTML
        ).text()}`;

        Common.logWarn("phonetics", phonetics);
        return phonetics;
    }

    async getExamples(cardInputDto, count = 5) {
        Common.logWarn(`[getExamples] ${Oxford.name}`, cardInputDto);

        let exampleTags = $(await this.#getOxfordDocument(cardInputDto)).find(
            "span.x"
        );
        exampleTags = exampleTags.slice(0, count);

        let examples = [];
        for (const exampleTag of exampleTags) {
            examples.push($(exampleTag.outerHTML).text());
        }

        if (examples.length === 0) {
            return Constant.NO_EXAMPLE;
        }

        let word = cardInputDto.standardizedWord.word;
        for (let i = 0; i < examples.length; i++) {
            if (examples[i].includes(word)) {
                examples[i] = examples[i].replaceAll(word, `{{c1::${word}}}`);
            } else {
                examples[i] = "{} {}".format(examples[i], "{{c1::...}}");
            }
        }

        return await Flash.buildExamples(examples);
    }

    async getSounds(cardInputDto) {
        Common.logWarn(`[getSounds] ${Oxford.name}`, cardInputDto);

        let soundLinks = [];
        for (const selector of ["div.pron-uk", "div.pron-us"]) {
            let [soundTag] = $(
                await this.#getOxfordDocument(cardInputDto)
            ).find(selector);
            soundLinks.push($(soundTag.outerHTML).attr("data-src-mp3"));
        }

        Common.logWarn("soundLinks", soundLinks);
        if (!cardInputDto.isOnline) {
            await Flash.downloadFiles(soundLinks);
        }

        let sounds = [];
        for (let sound of soundLinks) {
            if (!cardInputDto.isOnline) {
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

    async getImages(cardInputDto) {
        Common.logWarn(`[getImages] ${Oxford.name}`, cardInputDto);

        let [imageTag] = $(await this.#getOxfordDocument(cardInputDto)).find(
            "a.topic"
        );
        if (imageTag) {
            let imageLink = $(imageTag.outerHTML).attr("href");

            let image = imageLink;
            Common.logWarn("imageLink", imageLink);

            if (!cardInputDto.isOnline) {
                await Flash.downloadFiles([imageLink]);
                image = imageLink.split("/").pop();
            }

            image = '<img src="' + image + '"/>';
            return image;
        } else {
            return '<a href="https://www.google.com/search?biw=1280&bih=661&tbm=isch&sa=1&q={}" style="font-size: 15px; color: blue">Search Images</a>'.format(
                cardInputDto.standardizedWord.wordOri
            );
        }
    }

    async getMeaning(cardInputDto) {
        Common.logWarn(`[getMeaning] ${Oxford.name}`, cardInputDto);

        let [sense] = $(await this.#getOxfordDocument(cardInputDto)).find(
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

    async #getOxfordDocument(cardInputDto) {
        let [
            standardizedWord,
        ] = this.genInputDto.standardizedWords.filter((w) =>
            Common.compareTwoJsonObjects(cardInputDto.standardizedWord, w)
        );

        if (standardizedWord.oxfordDocument) {
            return standardizedWord.oxfordDocument;
        }

        standardizedWord.oxfordDocument = await Common.fetchNeutral({
            method: "GET",
            respType: Common.RESP_TYPE_ENUM.TEXT,
            url: Constant.OX_EN_EN_SEARCH_URL.format(standardizedWord.wordId),
        });

        return standardizedWord.oxfordDocument;
    }

    async #getOxfordCss() {
        if (this.genInputDto.oxfordCss) {
            return this.genInputDto.oxfordCss;
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

        this.genInputDto.oxfordCss = oxfordCss.replaceAll(
            "div.collapse .body .unbox:first-of-type",
            "div.collapse .body .unbox"
        );

        return this.genInputDto.oxfordCss;
    }
}
