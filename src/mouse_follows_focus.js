const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { Clutter, Meta } = imports.gi;
const { getPointerWatcher } = imports.ui.pointerWatcher;
const { SignalManager } = Me.imports.src.signal_management;
const { hasPointerActually, PointerManager } =
    Me.imports.src.pointer_management;

function connectToWindow(signalManager, pointerManager, window) {
    if (window.get_window_type() !== Meta.WindowType.NORMAL) {
        return;
    }

    let lastPositionChangeTime = 0;
    const initialFocusAttempt = setTimeout(() => {
        if (window.has_focus() && !hasPointerActually(window)) {
            pointerManager.restorePointer(window);
        }
    }, 100);

    signalManager.connect(window, "position-changed", (window) => {
        const now = new Date().getTime();
        const debounced = now - lastPositionChangeTime < 100;

        if (window.has_focus() && !hasPointerActually(window) && !debounced) {
            clearTimeout(initialFocusAttempt);
            pointerManager.restorePointer(window);
        }
        lastPositionChangeTime = now;
    });
}

var Extension = class Extension {
    constructor() {}

    enable() {
        this.pointer_manager = PointerManager.new("mouse");
        this.signal_manager = new SignalManager();

        this.pointer_watcher = getPointerWatcher().addWatch(10, (x, y) => {
            const pointer = new Meta.Rectangle({ x, y });
            const window = global.display.focus_window;

            if (window && window.get_buffer_rect().contains_rect(pointer)) {
                this.pointer_manager.storePosition(window, x, y);
            }
        });

        this.signal_manager.connect(
            global.display,
            "window-created",
            (display, window) =>
                connectToWindow(
                    this.signal_manager,
                    this.pointer_manager,
                    window,
                ),
        );

        global.display
            .get_tab_list(Meta.TabList.NORMAL_ALL, null)
            .forEach((window) =>
                connectToWindow(
                    this.signal_manager,
                    this.pointer_manager,
                    window,
                ),
            );
    }

    disable() {
        this.pointer_manager ? this.pointer_manager.destroy() : undefined;
        this.signal_manager ? this.signal_manager.destroy() : undefined;
        this.pointer_watcher ? this.pointer_watcher.remove() : undefined;

        this.pointer_manager = null;
        this.signal_manager = null;
        this.pointer_watcher = null;
    }
};

function init() {
    return new Extension();
}
