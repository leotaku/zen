/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/*
 * Adapted from the activate-window-by-title extension project by
 * Lucas Werkmeister.
 *
 * https://github.com/lucaswerkmeister/activate-window-by-title
 */

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const { Gio, Meta } = imports.gi;
const { main: Main } = imports.ui;
const { PointerManager } = Me.imports.src.pointer_management;

function getWindows(workspace) {
    // We ignore skip-taskbar windows in switchers, but if they are attached
    // to their parent, their position in the MRU list may be more appropriate
    // than the parent; so start with the complete list ...
    let windows = global.display.get_tab_list(
        Meta.TabList.NORMAL_ALL,
        workspace,
    );

    return (
        windows
            // ... map windows to their parent where appropriate ...
            .map((w) => (w.is_attached_dialog() ? w.get_transient_for() : w))
            // ... and filter out skip-taskbar windows and duplicates
            .filter((w, i, a) => !w.skip_taskbar && a.indexOf(w) === i)
    );
}

function focusByPredicate(predicate, workspace) {
    for (const window of getWindows(workspace)) {
        if (predicate(window)) {
            Main.activateWindow(window);
            PointerManager.ephemeral("focus").restorePointer(window);
            return true;
        }
    }
    return false;
}

const ActivateWindowByTitleInterface = `
<node>
  <interface name="gs.le0.zen.WindowFocus">
    <method name="focusByWmClass">
      <arg name="name" type="s" direction="in" />
      <arg name="found" type="b" direction="out" />
    </method>
    <method name="focusByWmClassOnWorkspace">
      <arg name="name" type="s" direction="in" />
      <arg name="found" type="b" direction="out" />
    </method>
  </interface>
</node>
`;

var Extension = class Extension {
    enable() {
        this.dbus = Gio.DBusExportedObject.wrapJSObject(
            ActivateWindowByTitleInterface,
            this,
        );
        this.dbus.export(Gio.DBus.session, "/gs/le0/zen/WindowFocus");
    }

    disable() {
        this.dbus
            ? this.dbus.unexport_from_connection(Gio.DBus.session)
            : undefined;

        this.dbus = null;
    }

    focusByWmClass(name) {
        return focusByPredicate(
            (window) =>
                name.localeCompare(window.get_wm_class(), "en", {
                    sensitivity: "accent",
                }) === 0,
            null,
        );
    }

    focusByWmClassOnWorkspace(name) {
        const workspace = global.workspace_manager.get_active_workspace();
        return focusByPredicate(
            (window) =>
                name.localeCompare(window.get_wm_class(), "en", {
                    sensitivity: "accent",
                }) === 0,
            workspace,
        );
    }
};

function init() {
    return new Extension();
}
