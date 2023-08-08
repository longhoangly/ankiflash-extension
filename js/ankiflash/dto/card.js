export class Card {
    // word in html meaning
    word;
    // word id for getting html
    wordId;
    // original word from user's input
    oriWord;

    wordType;
    phonetic;
    example;

    image;
    sounds;
    status;

    meaning;
    copyright;
    comment;
    tag;

    translation;

    constructor(translation) {
        this.translation = translation;
    }
}
