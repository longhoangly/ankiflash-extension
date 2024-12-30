/** @format */

export class Card {
	wordTypes;
	phonetics;
	examples;

	images;
	sounds;
	status;

	meaning;
	copyright;
	tag;

	cardInputDto;
	errorMessage;

	constructor(cardInputDto) {
		this.cardInputDto = cardInputDto;
	}
}
