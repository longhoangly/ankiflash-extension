import { Generator } from "../generator.js";

export class JpGen extends Generator {
    constructor(translation) {
        super();
        this.translation = translation;
    }

    async formatInputs(word, allWordTypes) {
        throw new Error("NotImplementedError");
    }

    async generateCard(formattedWord, mediaDir, isOnline) {
        throw new Error("NotImplementedError");
    }
}
