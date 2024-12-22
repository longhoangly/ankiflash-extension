export class Translation {
    source;
    target;

    constructor(source, target) {
        (this.source = source), (this.target = target);
    }

    static getInstance(obj) {
        return new Translation(obj.source, obj.target);
    }

    equals(translation) {
        return (
            this.source === translation.source &&
            this.target === translation.target
        );
    }

    belongTo(translations) {
        return translations.filter((t) => this.equals(t)).length > 0;
    }
}
