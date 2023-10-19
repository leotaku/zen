# Zen

This Gnome extension provides various bits of functionality that aim to make your experience more predictable.
While the provided components are distributed as a single extension so they may integrate well with each other, they work independently and can be enabled and disabled in the extension preferences.

One of the core beliefs of this extension is that your mouse cursor should almost always be inside your focused window.
As such, whenever you use this extension to focus a window, the mouse cursor will be placed inside it.
Whenever possible, the extension will try to remember the previous position of the cursor to further improve the window switching experience.

## Components

+ **Direct Window Switch** :: switch between windows using Super-TAB without any annoying menu
+ **Mouse Follows Focus** :: teleport cursor when new windows launch and focused windows move
+ **DBus Window Focus** :: focus windows programmatically using a simple DBus interface

## Provenance

The "Direct Window Switch" functionality has been adapted from Matthijs Kooijman's MIT licensed [gnome-shell-more-keyboard-shortcuts](https://github.com/matthijskooijman/gnome-shell-more-keyboard-shortcuts) extension.
The "DBus Window Focus" functionality has been adapted from Lucas Werkmeister's GPL-2.0 licensed [activate-window-by-title](https://github.com/lucaswerkmeister/activate-window-by-title) extension.
The Makefile was inspired by the GPL-3.0 licensed [Pop!\_OS Shell](https://github.com/pop-os/shell) project.

## License

This Gnome extension is distributed under the terms of the [GPL-3.0-or-later](LICENSE) license, meaning the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Any other applicable copyright notices should be included within individual files of source code.
