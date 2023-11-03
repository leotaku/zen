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
const { PointerManager } = Me.imports.src.pointer_management;

function mapTransientToParent(window) {
    return window.is_attached_dialog() ? window.get_transient_for() : window;
}

function switchWindow(pointerManager, next) {
    let windows = global.workspace_manager
        .get_active_workspace()
        .list_windows();

    // Generate a stable ordering for the window list.
    windows.sort(function (w1, w2) {
        return w1.get_stable_sequence() - w2.get_stable_sequence();
    });

    // If the current window is a transient for a window, resolve it
    // to the real, non-transient window first (that is the one that
    // is shown in the taskbar).
    let current = mapTransientToParent(global.display.focus_window);
    let index = windows.findIndex((it) => it == current);

    // Generate a list of all non-focused windows on this workspace
    // starting with the window after the currently focused window.
    let possibleTargets = windows
        .slice(index + 1)
        .concat(windows.slice(0, index));

    // If previous window was requested, reverse the sequence.
    if (!next) {
        possibleTargets.reverse();
    }

    // Find the next window that does not have skip_taskbar and is
    // also not a transient window.
    let target = possibleTargets.find(
        (it) => !it.skip_taskbar && !it.get_transient_for(),
    );

    // If a suitable window was found, focus it.
    if (target) {
        pointerManager.storePointer(current);
        Main.activateWindow(target);
        pointerManager.restorePointer(target);
    }
}

var Extension = class Extension {
    constructor() {}

    enable() {
        this.settings = ExtensionUtils.getSettings();
        this.pointer_manager = PointerManager.new("focus");

        Main.wm.addKeybinding(
            "switch-window-next-workspace",
            this.settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode
                ? Shell.ActionMode.NORMAL
                : Shell.KeyBindingMode.NORMAL,
            (display, screen, window, binding) => {
                switchWindow(this.pointer_manager, true);
            },
        );
        Main.wm.addKeybinding(
            "switch-window-prev-workspace",
            this.settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode
                ? Shell.ActionMode.NORMAL
                : Shell.KeyBindingMode.NORMAL,
            (display, screen, window, binding) => {
                switchWindow(this.pointer_manager, false);
            },
        );
    }

    disable() {
        Main.wm.removeKeybinding("switch-window-next-workspace");
        Main.wm.removeKeybinding("switch-window-prev-workspace");

        this.pointer_manager ? this.pointer_manager.destroy() : undefined;
        this.pointer_manager = null;

        this.settings = null;
    }
};

function init() {
    return new Extension();
}
