/** @format */

import { Common } from "../../base/common.js";
import { Dictionary } from "../dictionary.js";

export class Cambridge extends Dictionary {
	constructor(genInputDto) {
		super(genInputDto);
	}

	async getWordTypes(cardInputDto) {
		Common.logWarn(`[getWordTypes] ${Cambridge.name}`, cardInputDto);
	}

	async getPhonetics(cardInputDto) {
		Common.logWarn(`[getPhonetics] ${Cambridge.name}`, cardInputDto);
	}

	async getExamples(cardInputDto) {
		Common.logWarn(`[getExamples] ${Cambridge.name}`, cardInputDto);
	}

	async getSounds(cardInputDto) {
		Common.logWarn(`[getSounds] ${Cambridge.name}`, cardInputDto);
	}

	async getImages(cardInputDto) {
		Common.logWarn(`[getImages] ${Cambridge.name}`, cardInputDto);
	}

	async getMeaning(cardInputDto) {
		Common.logWarn(`[getMeaning] ${Cambridge.name}`, cardInputDto);
	}

	async getCopyright() {
		return `The content of this card is get from the dictionary: ${Cambridge.name}`;
	}
}
