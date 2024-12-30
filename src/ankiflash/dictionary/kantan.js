/** @format */

import { Common } from "../../base/common.js";
import { Constant } from "../../base/constant.js";
import { Dictionary } from "../dictionary.js";

export class Kantan extends Dictionary {
	constructor(genInputDto) {
		super(genInputDto);
	}

	async standardizedWords() {
		Common.logWarn(`[standardizedWords] ${Kantan.name}`);

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
		Common.logWarn(`[getWordTypes] ${Kantan.name}`, cardInputDto);
	}

	async getPhonetics(cardInputDto) {
		Common.logWarn(`[getPhonetics] ${Kantan.name}`, cardInputDto);
	}

	async getExamples(cardInputDto, count = 5) {
		Common.logWarn(`[getExamples] ${Kantan.name}`, cardInputDto);
	}

	async getSounds(cardInputDto) {
		Common.logWarn(`[getSounds] ${Kantan.name}`, cardInputDto);
	}

	async getImages(cardInputDto) {
		Common.logWarn(`[getImages] ${Kantan.name}`, cardInputDto);
	}

	async getMeaning(cardInputDto) {
		Common.logWarn(`[getMeaning] ${Kantan.name}`, cardInputDto);
	}

	async #getKantanDocument(cardInputDto) {
		let [standardizedWord] = this.genInputDto.standardizedWords.filter(
			(w) =>
				Common.compareTwoJsonObjects(cardInputDto.standardizedWord, w)
		);

		if (standardizedWord.kantanDocument) {
			return standardizedWord.kantanDocument;
		}

		standardizedWord.kantanDocument = await Common.fetchNeutral({
			method: "GET",
			respType: Common.RESP_TYPE_ENUM.TEXT,
			url: Constant.KT_VNJP_JPVN_URL.format(standardizedWord.wordId),
		});

		return standardizedWord.kantanDocument;
	}

	async #getKantanCss() {
		if (this.genInputDto.kantanCss) {
			return this.genInputDto.kantanCss;
		}

		const urlContent = await Common.getUrlContent("xxx");

		this.genInputDto.kantanCss = urlContent
			.replaceAll("\n", " ")
			.replaceAll("\r", " ")
			.replaceAll("\t", " ");

		return this.genInputDto.kantanCss;
	}
}
