var SignalManager = class SignalManager {
    constructor() {
        this.object_signal_pairs = [];
    }

    connect(object, name, callback) {
        const signal = object.connect(name, callback);
        this.object_signal_pairs.push([object, signal]);
    }

    destroy() {
        for (const [object, signal] of this.object_signal_pairs) {
            object?.disconnect?.(signal);
        }
    }
};
