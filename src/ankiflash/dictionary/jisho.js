/** @format */

import { Common } from "../../base/common.js";
import { Constant } from "../../base/constant.js";
import { Dictionary } from "../dictionary.js";

export class Jisho extends Dictionary {
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
		Common.logWarn(`[getWordTypes] ${Jisho.name}`, cardInputDto);
	}

	async getPhonetics(cardInputDto) {
		Common.logWarn(`[getPhonetics] ${Jisho.name}`, cardInputDto);
	}

	async getExamples(cardInputDto, count = 5) {
		Common.logWarn(`[getExamples] ${Jisho.name}`, cardInputDto);
	}

	async getSounds(cardInputDto) {
		Common.logWarn(`[getSounds] ${Jisho.name}`, cardInputDto);
	}

	async getImages(cardInputDto) {
		Common.logWarn(`[getImages] ${Jisho.name}`, cardInputDto);
	}

	async getMeaning(cardInputDto) {
		Common.logWarn(`[getMeaning] ${Jisho.name}`, cardInputDto);
	}

	async #getDocument(cardInputDto) {
		let [standardizedWord] = this.genInputDto.standardizedWords.filter(
			(w) =>
				Common.compareTwoJsonObjects(cardInputDto.standardizedWord, w)
		);

		if (standardizedWord.jishoDocument) {
			return standardizedWord.jishoDocument;
		}

		standardizedWord.jishoDocument = await Common.fetchNeutral({
			method: "GET",
			respType: Common.RESP_TYPE_ENUM.TEXT,
			url: Constant.JS_JP_EN_URL.format(standardizedWord.wordId),
		});

		return standardizedWord.jishoDocument;
	}

	async #getCss() {
		if (this.genInputDto.jishoCss) {
			return this.genInputDto.jishoCss;
		}

		const urlContent = await Common.getUrlContent("xxx");

		this.genInputDto.jishoCss = urlContent
			.replaceAll("\n", " ")
			.replaceAll("\r", " ")
			.replaceAll("\t", " ");

		return this.genInputDto.jishoCss;
	}
}
