/** @format */

import { Common } from "../../base/common.js";
import { Constant } from "../../base/constant.js";
import { Dictionary } from "../dictionary.js";

export class Wiktionary extends Dictionary {
	constructor(genInputDto) {
		super(genInputDto);
	}

	async getWordTypes(cardInputDto) {
		Common.logWarn(`[getWordTypes] ${Wiktionary.name}`, cardInputDto);
	}

	async getPhonetics(cardInputDto) {
		Common.logWarn(`[getPhonetics] ${Wiktionary.name}`, cardInputDto);
	}

	async getExamples(cardInputDto, count = 5) {
		Common.logWarn(`[getExamples] ${Wiktionary.name}`, cardInputDto);
	}

	async getSounds(cardInputDto) {
		Common.logWarn(`[getSounds] ${Wiktionary.name}`, cardInputDto);
	}

	async getImages(cardInputDto) {
		Common.logWarn(`[getImages] ${Wiktionary.name}`, cardInputDto);
	}

	async getMeaning(cardInputDto) {
		Common.logWarn(`[getMeaning] ${Wiktionary.name}`, cardInputDto);
	}

	async #getDocument(cardInputDto) {
		let [standardizedWord] = this.genInputDto.standardizedWords.filter(
			(w) =>
				Common.compareTwoJsonObjects(cardInputDto.standardizedWord, w)
		);

		if (standardizedWord.wiktionaryDocument) {
			return standardizedWord.wiktionaryDocument;
		}

		standardizedWord.wiktionaryDocument = await Common.fetchNeutral({
			method: "GET",
			respType: Common.RESP_TYPE_ENUM.TEXT,
			url: "xxx".format(standardizedWord.wordId),
		});

		return standardizedWord.kantanDocument;
	}

	async #getCss() {
		if (this.genInputDto.wiktionaryCss) {
			return this.genInputDto.wiktionaryCss;
		}

		const urlContent = await Common.getUrlContent("xxx");

		this.genInputDto.wiktionaryCss = urlContent
			.replaceAll("\n", " ")
			.replaceAll("\r", " ")
			.replaceAll("\t", " ");

		return this.genInputDto.wiktionaryCss;
	}
}
