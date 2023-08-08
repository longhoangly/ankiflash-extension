export class Translation {
    source;
    target;

    constructor(source, target) {
        (this.source = source), (this.target = target);
    }

    equals(translation) {
        if (translation instanceof Translation) {
            return (
                this.source === translation.source &&
                this.target === translation.target
            );
        } else {
            return false;
        }
    }

    belongTo(translations) {
        return translations.filter((t) => this.equals(t)).length > 0;
    }
}
