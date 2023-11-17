class SubExtensionBase {
    #settings;

    constructor(settings) {
        this.#settings = settings;
    }

    getSettings() {
        return this.#settings;
    }
}

export class SubExtension extends SubExtensionBase {
    enable() {}
    disable() {}
}

