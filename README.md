More keyboard shortcuts for Gnome Shell
=======================================
This is a simple gnome-shell extension that adds some extra keyboard
shortcuts for navigating through windows.

To install it, clone it into your ~/.local/share/gnome-shell/extensions
directory (be sure to name the directory "more-keyboard-shortcuts@stderr.nl",
matching the uuid from metadata.json). Afterwards, restart gnome-shell and
enable the extension in gnome-tweak tool (you might need to log out and in to
make is show up).

	$ mkdir -p ~/.local/share/gnome-shell/extensions
	$ git clone git://github.com/matthijskooijman/gnome-shell-more-keyboard-shortcuts \
	  ~/.local/share/gnome-shell/extensions/more-keyboard-shortcuts@stderr.nl

Alternatively, download a zip from github and use
gnome-tweak-tool to install it.

Configuring shortcuts needs to happen manually right now, through e.g
dconf-editor or gsettings. For those tools to know about the settings,
first link or copy the
`schemas/org.gnome.shell.extensions.more-keyboard-shortcuts.gschema.xml`
file to `/usr/share/glib-2.0/schemas` or
`~/.local/share/glib-2.0/schemas` and run `glib-compile-schemas` on the
directory you installed it in. The settings then live under the
org.gnome.shell.extensions.more-keyboard-shortcuts id / path.

License
=======
This extension and all accompanying files are licensed under the MIT license.

Copyright (c) 2014 Matthijs Kooijman <matthijs@stdin.nl>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
