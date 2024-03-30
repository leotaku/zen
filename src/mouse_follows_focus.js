import Clutter from "gi://Clutter";
import Meta from "gi://Meta";
import Mtk from "gi://Mtk";

import { Submodule } from "./sub_module.js";
import { getPointerWatcher } from "resource:///org/gnome/shell/ui/pointerWatcher.js";
import { hasPointerActually, PointerManager } from "./pointer_management.js";
import { SourceManager } from "./source_management.js";

function connectToWindow(sourceManager, pointerManager, window) {
    if (window.get_window_type() !== Meta.WindowType.NORMAL) {
        return;
    }

    let lastPositionChangeTime = 0;
    const initialFocusAttempt = sourceManager.setTimeout(() => {
        if (window.has_focus() && !hasPointerActually(window)) {
            pointerManager.restorePointer(window);
        }
    }, 100);

    sourceManager.connect(window, "position-changed", (window) => {
        const now = new Date().getTime();
        const debounced = now - lastPositionChangeTime < 100;

        if (window.has_focus() && !hasPointerActually(window) && !debounced) {
            sourceManager.clearTimeout(initialFocusAttempt);
            pointerManager.restorePointer(window);
        }
        lastPositionChangeTime = now;
    });
}

export default class MouseFollowsFocusModule extends Submodule {
    enable() {
        this.pointer_manager = PointerManager.new("mouse");
        this.source_manager = new SourceManager();

        this.pointer_watcher = getPointerWatcher().addWatch(10, (x, y) => {
            const pointer = new Mtk.Rectangle({ x, y });
            const window = global.display.focus_window;

            if (window && window.get_buffer_rect().contains_rect(pointer)) {
                if (!this.pointer_manager) {
                    // This path should be unreachable, but sometimes
                    // the watch callback seems to be run after it has
                    // been removed and properties have been nulled.
                    // In this case, return to avoid erroring out.
                    return;
                }
                this.pointer_manager.storePosition(window, x, y);
            }
        });

        this.source_manager.connect(
            global.display,
            "window-created",
            (display, window) =>
                connectToWindow(
                    this.source_manager,
                    this.pointer_manager,
                    window,
                ),
        );

        global.display
            .get_tab_list(Meta.TabList.NORMAL_ALL, null)
            .forEach((window) =>
                connectToWindow(
                    this.source_manager,
                    this.pointer_manager,
                    window,
                ),
            );
    }

    disable() {
        this.pointer_manager?.destroy();
        this.source_manager?.destroy();
        this.pointer_watcher?.remove();

        this.pointer_manager = null;
        this.signal_manager = null;
        this.pointer_watcher = null;
    }
}
