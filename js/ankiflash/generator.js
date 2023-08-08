import { Common } from "../base/common";
import { Constant } from "../base/constant";
import { Card } from "./dto/card";
import { Status } from "./dto/status";

export class Generator {
    formatInputs(word, translation, allWordTypes) {
        throw new Error("NotImplementedError");
    }

    generateCard(formattedWord, translation, mediaDir, isOnline) {
        throw new Error("NotImplementedError");
    }

    initializeCard(formattedWord, translation) {
        let card = new Card(translation);
        let wordParts = formattedWord.split(Constant.SUB_DELIMITER);

        if (
            formattedWord.includes(Constant.SUB_DELIMITER) &&
            wordParts.length == 3
        ) {
            card.status = Status.SUCCESS;
            card.comment = Constant.SUCCESS;
        } else {
            throw new Error(
                "Incorrect formattedWord: {}".format(formattedWord)
            );
        }

        Common.logInfo("source = {}".format(translation.source));
        Common.logInfo("target = {}".format(translation.target));

        return card;
    }
}
