const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionSystem = imports.ui.extensionSystem;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();
const ScrollablePopupMenu = Me.imports.scrollablePopupMenu.ScrollablePopupMenu;
const PopupExtensionItem = Me.imports.popupExtensionItem.PopupExtensionItem;

const Convenience = Me.imports.convenience;
const Gettext = imports.gettext.domain('extensions');
const _ = Gettext.gettext;


const ExtensionsManager = new Lang.Class({
    Name: 'ExtensionsManager',

    containerType: -1,
    _init: function() {
        this._settings = Convenience.getSettings();
        this._settings.connect('changed', Lang.bind(this, this._refresh));
        this._createContainer()
    },
    _createContainer: function() {
        this.containerType = this._settings.get_enum('position');

        if (this.containerType == 0) {
            this.container = new PanelMenu.Button()
            PanelMenu.Button.prototype._init.call(this.container, St.Align.START, 'extensionsManager', true);

            this.menu = new ScrollablePopupMenu(this.container.actor, St.Align.START, St.Side.TOP);
            this.container.setMenu(this.menu);

            let hbox = new St.BoxLayout({style_class: 'panel-status-menu-box' });
            let icon = new St.Icon({icon_name: 'goa-panel-symbolic', style_class: 'system-status-icon'});
            hbox.add_child(icon);

            this.container.actor.add_actor(hbox);
            this.container.actor.add_style_class_name('panel-status-button');

            this.container.actor.connect('button-press-event', Lang.bind(this, function() {
                this._refresh();
            }));

            Main.panel.addToStatusArea('extensions', this.container);
        } else {
            this.container = new PopupMenu.PopupSubMenuMenuItem("Extensions", true);
            this.container.icon.style_class = 'system-extensions-submenu-icon';
            this.container.icon.icon_name = 'goa-panel-symbolic';
            this.menu = this.container.menu

            Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.container, 8);
        }

        this.container.actor.connect('button-press-event', Lang.bind(this, function() {
            this._refresh();
        }));

        this._refresh();
    },
    _refresh: function() {
        if (this.containerType != this._settings.get_enum('position')) {
            this.container.destroy();
            this._createContainer();
        }

        this.menu.removeAll();
        let uuids = Object.keys(ExtensionUtils.extensions);

        uuids.sort(function(a, b) {
            a = ExtensionUtils.extensions[a].metadata.name.toLowerCase();
            b = ExtensionUtils.extensions[b].metadata.name.toLowerCase();

            return a < b ? -1 : (a > b ? 1 : 0);
        });

        uuids.forEach(Lang.bind(this, function(uuid) {
            let item = new PopupExtensionItem(uuid);
            this.menu.addMenuItem(item);
        }));

        if(this.menu.bottomSection) {
            this.menu.bottomSection.remove_all_children();

            if (this._settings.get_boolean('show-add')) {
                this.menu.bottomSection.add((new PopupMenu.PopupSeparatorMenuItem()).actor);

                let itemAdd = new PopupMenu.PopupMenuItem(_("Add gnome shell extensions ..."));

                itemAdd.connect('activate', Lang.bind(this, function(object, event) {
                    this.menu.close()
                    Gio.AppInfo.launch_default_for_uri("https://extensions.gnome.org",
                        global.create_app_launch_context(event.get_time(), 0));
                }));

                this.menu.bottomSection.add(itemAdd.actor);
            }
        }

        return true;
    },
    destroy: function() {
        this.container.destroy();
    }
});

let extensionsManager;

function init() {
    Convenience.initTranslations("extensions");
}

function enable() {
    extensionsManager = new ExtensionsManager();
}

function disable() {
    extensionsManager.destroy();
    extensionsManager = null;
}
