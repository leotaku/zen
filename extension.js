/**
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
 *
 *
 * This is a simple gnome-shell extension that adds some extra keyboard
 * shortcuts for navigating through windows.
 */
const Meta = imports.gi.Meta;
const Main = imports.ui.main;
const Shell = imports.gi.Shell;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

let settings;

function init() {
    settings = Convenience.getSettings();
}

function switchWindow(next) {
    let workspace = global.screen.get_active_workspace();
    let windows = workspace.list_windows();

    // Generate a stable ordering for the window list (based on the
    // Frippery Bottom Panel extension)
    windows.sort(function(w1, w2) {
        return w1.get_stable_sequence() - w2.get_stable_sequence();
    });

    // Find out the index of the current window
    let current_idx = -1;
    for ( let i = 0; i < windows.length; ++i ) {
        if (windows[i].has_focus()) {
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
        // Focuse the next/previous window that does not have
        // skip_taskbar set
        target_idx = current_idx;
        do {
            target_idx += (next ? 1 : -1);
            // Modulo doesn't handle -1 here, so make sure we are
            // positive first
            target_idx += windows.length;
            target_idx %= windows.length;
        } while (windows[target_idx].skip_taskbar && target_idx != i);
    }

    Main.activateWindow(windows[target_idx]);
}

function enable() {
    // Switch to the next/previous window within this workspace. Window
    // ordering is fixed (not based on most recent use like the alt-tab
    // switcher) so it can match a window list shown by e.g. the
    // Frippery Bottom Panel.
    Main.wm.addKeybinding("switch-window-next-workspace",
        settings,
        Meta.KeyBindingFlags.NONE,
        Shell.KeyBindingMode.NORMAL,
        function(display, screen, window, binding) {
            switchWindow(true);
        }
    );
    Main.wm.addKeybinding("switch-window-prev-workspace",
        settings,
        Meta.KeyBindingFlags.NONE,
        Shell.KeyBindingMode.NORMAL,
        function(display, screen, window, binding) {
            switchWindow(false);
        }
    );
}

function disable() {
}
