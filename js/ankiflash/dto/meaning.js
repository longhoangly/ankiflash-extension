export class Meaning {
    wordType;
    meaning;
    subMeaning;
    examples;

    constructor(meaning, examples) {
        (this.meaning = meaning), (this.examples = examples);
    }
}
