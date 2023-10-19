const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { Clutter, Meta } = imports.gi;
const { pointerWatcher: PointerWatcher } = imports.ui;
const { hasPointerActually, PointerManager } =
    Me.imports.src.pointer_management;

var Extension = class Extension {
    constructor() {}

    enable() {
        this.pointer_manager = PointerManager.new("mouse");

        this.pointer_watcher = PointerWatcher.getPointerWatcher().addWatch(
            10,
            (x, y) => {
                let pointer = new Meta.Rectangle({ x, y });
                let window = global.display.focus_window;

                if (window && window.get_buffer_rect().contains_rect(pointer)) {
                    this.pointer_manager.storePosition(window, x, y);
                }
            },
        );

        this.create_signal = global.display.connect(
            "window-created",
            (display, window) => {
                if (window.get_window_type() !== Meta.WindowType.NORMAL) {
                    return;
                }

                let initialFocusAttempt = setTimeout(() => {
                    if (window.has_focus() && !hasPointerActually(window)) {
                        this.pointer_manager.restorePointer(window);
                    }
                }, 100);

                window.connect("position-changed", (window) => {
                    if (window.has_focus() && !hasPointerActually(window)) {
                        clearTimeout(initialFocusAttempt);
                        this.pointer_manager.restorePointer(window);
                    }
                });
            },
        );
    }

    disable() {
        this.pointer_manager ? this.pointer_manager.destroy() : undefined;
        this.pointer_watcher ? this.pointer_watcher.remove() : undefined;
        this.create_signal
            ? global.display.disconnect(this.create_signal)
            : undefined;

        this.pointer_manager = null;
        this.pointer_watcher = null;
        this.create_signal = null;
    }
};

function init() {
    return new Extension();
}
