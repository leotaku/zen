class SubmoduleBase {
    #settings;

    constructor(settings) {
        this.#settings = settings;
    }

    getSettings() {
        return this.#settings;
    }
}

export class Submodule extends SubmoduleBase {
    enable() {}
    disable() {}
}

