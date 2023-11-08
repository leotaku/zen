var SourceManager = class SourceManager {
    constructor() {
        this.object_signal_pairs = [];
        this.timeouts = new Set();
    }

    connect(object, name, callback) {
        const signal = object.connect(name, callback);
        this.object_signal_pairs.push([object, signal]);
    }

    setTimeout(handler, timeout, ...arguments_) {
        const result = setTimeout(handler, timeout, ...arguments_);
        this.timeouts.add(result);
        return result;
    }

    clearTimeout(id) {
        if (this.timeouts.delete(id)) {
            clearTimeout(id);
        }
    }

    destroy() {
        for (const [object, signal] of this.object_signal_pairs) {
            object?.disconnect?.(signal);
        }
        for (const timeout of this.timeouts.values()) {
            clearTimeout(timeout);
        }
    }
};
