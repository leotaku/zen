/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Matthijs Kooijman <matthijs@stdin.nl>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*
 * Adapted from the gnome-shell-more-keyboard-shortcuts extension
 * project by Matthijs Kooijman.
 *
 * https://github.com/matthijskooijman/gnome-shell-more-keyboard-shortcuts
 */

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { Clutter, Meta, Shell } = imports.gi;
const { main: Main } = imports.ui;

function absolute_to_relative(x, y, rect) {
    let rel_x = (x - rect.x) / rect.width;
    let rel_y = (y - rect.y) / rect.height;

    return [rel_x, rel_y];
}

function relative_to_absolute(x, y, rect) {
    let abs_x = x * rect.width + rect.x;
    let abs_y = y * rect.height + rect.y;

    return [abs_x, abs_y];
}

function rememberPointerForWindow(window) {
    let rect = window.get_buffer_rect();
    let [mouse_x, mouse_y, _] = global.get_pointer();
    let [rel_x, rel_y] = absolute_to_relative(mouse_x, mouse_y, rect);

    window.__zen_window_coords = [rel_x, rel_y];
}

function restorePointerForWindow(window) {
    let rect = window.get_buffer_rect();
    let seat = Clutter.get_default_backend().get_default_seat();

    if (seat === null) {
        return;
    }

    if (window.__zen_window_coords) {
        let [rel_x, rel_y] = window.__zen_window_coords;
        let [abs_x, abs_y] = relative_to_absolute(rel_x, rel_y, rect);
        seat.warp_pointer(abs_x, abs_y);
    } else {
        seat.warp_pointer(rect.x + rect.width / 2, rect.y + rect.height / 2);
    }
}

function switchWindow(next) {
    let workspace = (
        global.screen || global.workspace_manager
    ).get_active_workspace();
    let windows = workspace.list_windows();

    // Generate a stable ordering for the window list (based on the
    // Frippery Bottom Panel extension)
    windows.sort(function (w1, w2) {
        return w1.get_stable_sequence() - w2.get_stable_sequence();
    });

    var current_window = global.display.focus_window;

    // If the current window is a transient modal window, resolve it
    // to the real, non-transient window first (which is the one
    // that is shown in the taskbar).
    while (
        current_window &&
        current_window.get_window_type() == Meta.WindowType.MODAL_DIALOG &&
        current_window.get_transient_for()
    )
        current_window = current_window.get_transient_for();

    // Find out the index of the current window
    let current_idx = -1;
    for (let i = 0; i < windows.length; ++i) {
        if (windows[i] == current_window) {
            current_idx = i;
            break;
        }
    }

    // Figure out what window to focus
    let target_idx;
    if (current_idx < 0) {
        // No window was focused, just focus the first in the list
        target_idx = 0;
    } else {
        // Focus the next/previous window that does not have
        // skip_taskbar and is not a modal window. Note that focusing a
        // window that has a modal transient will focus the modal
        // instead, but the code above resolves that back to the real
        // window, so everything still works as you'd expect.
        target_idx = current_idx;
        do {
            target_idx += next ? 1 : -1;
            // Modulo doesn't handle -1 here, so make sure we are
            // positive first
            target_idx += windows.length;
            target_idx %= windows.length;
            // Don't keep looping if this is the only focusable window
            if (target_idx == current_idx) break;
        } while (
            windows[target_idx].skip_taskbar ||
            windows[target_idx].get_window_type() ==
                Meta.WindowType.MODAL_DIALOG
        );
    }

    let window = windows[target_idx];

    rememberPointerForWindow(current_window);
    Main.activateWindow(window);
    restorePointerForWindow(window);
}

function cleanupCustomProperties() {
    for (const actor of global.get_window_actors()) {
        if (actor.is_destroyed()) {
            continue;
        }

        const win = actor.get_meta_window();
        if (win._zen_window_coords) {
            delete win._zen_window_coords;
        }
    }
}

var Extension = class Extension {
    constructor() {}

    enable() {
        this.settings = ExtensionUtils.getSettings();

        // Switch to the next/previous window within this workspace. Window
        // ordering is fixed (not based on most recent use like the alt-tab
        // switcher) so it can match a window list shown by e.g. the
        // Frippery Bottom Panel.
        Main.wm.addKeybinding(
            "switch-window-next-workspace",
            this.settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode
                ? Shell.ActionMode.NORMAL
                : Shell.KeyBindingMode.NORMAL,
            function (display, screen, window, binding) {
                switchWindow(true);
            },
        );
        Main.wm.addKeybinding(
            "switch-window-prev-workspace",
            this.settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode
                ? Shell.ActionMode.NORMAL
                : Shell.KeyBindingMode.NORMAL,
            function (display, screen, window, binding) {
                switchWindow(false);
            },
        );
    }

    disable() {
        Main.wm.removeKeybinding("switch-window-next-workspace");
        Main.wm.removeKeybinding("switch-window-prev-workspace");
        cleanupCustomProperties();

        this.settings = null;
    }
};

function init() {
    return new Extension();
}
