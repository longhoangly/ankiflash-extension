/** @format */

import { Common } from "../base/common.js";

export class Dictionary {
	genInputDto;

	constructor(genInputDto) {
		this.genInputDto = genInputDto;

		if (this.constructor === Dictionary) {
			throw new Error(
				`${Dictionary.name} class is of abstract type and can't be instantiated`
			);
		}
	}

	async standardizedWords() {
		Common.logWarn(`[standardizedWords] ${Dictionary.name}`);

		let stdWords = [];
		for (const word of this.genInputDto.words) {
			stdWords.push({
				word: word,
				wordId: word,
				wordOri: word,
			});
		}
		return stdWords;
	}

	async getWordTypes(cardInputDto) {
		throw new Error("Method [getWordTypes] is not implemented");
	}

	async getPhonetics(cardInputDto) {
		throw new Error("Method [getPhonetics] is not implemented");
	}

	async getExamples(cardInputDto) {
		throw new Error("Method [getExamples] is not implemented");
	}

	async getSounds(cardInputDto) {
		throw new Error("Method [getSounds] is not implemented");
	}

	async getImages(cardInputDto) {
		throw new Error("Method [getImages] is not implemented");
	}

	async getMeaning(cardInputDto) {
		throw new Error("Method [getMeaning] is not implemented");
	}

	async getTag(cardInputDto) {
		return cardInputDto.standardizedWord.word[0];
	}

	async getCopyright(genInputDto) {
		return `The content of this card is get from the dictionary: ${genInputDto.mainDict}`;
	}
}
