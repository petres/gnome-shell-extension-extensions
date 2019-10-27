const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Gio = imports.gi.Gio;

const ExtensionUtils = imports.misc.extensionUtils;

const Gettext = imports.gettext
const _ = Gettext.gettext;
const N_ = x => x;

const Me = ExtensionUtils.getCurrentExtension();
//const ScrollablePopupMenu = Me.imports.scrollablePopupMenu.ScrollablePopupMenu;
var PopupExtensionItem = Me.imports.popupExtensionItem.PopupExtensionItem;


var ExtensionsManager = new Lang.Class({
    Name: 'ExtensionsManager',

    containerType: -1,

    _init: function() {
        this._settings = ExtensionUtils.getSettings();
        this._settings.connect('changed', Lang.bind(this, this._refresh));
        this._createContainer()
    },

    _createContainer: function() {
        this.containerType = this._settings.get_enum('position');

        if (this.containerType == 0) {
            this.container = new PanelMenu.Button(St.Align.START, 'extensionsManager');
            //this.container = new PanelMenu.Button(St.Align.START, 'extensionsManager', true);
            //this.menu = new PopupMenu.PopupMenu(this.container.actor, St.Align.START, St.Side.TOP);
            //this.container.setMenu(this.menu);

            let hbox = new St.BoxLayout({style_class: 'panel-status-menu-box' });
            let icon = new St.Icon({icon_name: 'goa-panel-symbolic', style_class: 'system-status-icon'});
            hbox.add_child(icon);

            this.container.add_actor(hbox);
            this.container.add_style_class_name('panel-status-button');

            Main.panel.addToStatusArea('extensions', this.container);
        } else {
            this.container = new PopupMenu.PopupSubMenuMenuItem("Extensions", true);
            this.container.icon.style_class = 'system-extensions-submenu-icon';
            this.container.icon.icon_name = 'goa-panel-symbolic';
            this.menu = this.container.menu

            Main.panel.statusArea.aggregateMenu.menu.addMenuItem(this.container, 8);
        }

        this.menu = this.container.menu

        this.container.connect('button-press-event', Lang.bind(this, function() {
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

        // Main.extensionManager.getUuids().forEach(uuid => {
        //     this._loadExtension(uuid);
        // });
        let uuids = Main.extensionManager.getUuids();
        uuids.sort(function(a, b) {
            a = Main.extensionManager.lookup(a).metadata.name.toLowerCase();
            b = Main.extensionManager.lookup(b).metadata.name.toLowerCase();

            return a < b ? -1 : (a > b ? 1 : 0);
        });

        uuids.forEach(Lang.bind(this, function(uuid) {
            this.menu.addMenuItem(new PopupExtensionItem(uuid));
        }));

        if (this.menu.bottomSection) {
            this.menu.bottomSection.remove_all_children();

            if (this._settings.get_boolean('show-add')) {
                this.menu.bottomSection.add(new PopupMenu.PopupSeparatorMenuItem());

                let itemAdd = new PopupMenu.PopupMenuItem(_("Add gnome shell extensions ..."));

                itemAdd.connect('activate', Lang.bind(this, function(object, event) {
                    this.menu.close()
                    Gio.AppInfo.launch_default_for_uri("https://extensions.gnome.org",
                        global.create_app_launch_context(event.get_time(), 0));
                }));

                this.menu.bottomSection.add(itemAdd);
            }
        }

        return true;
    },

    destroy: function() {
        this.container.destroy();
    }
});

var _extensionIndicator;

function init() {
    ExtensionUtils.initTranslations('gnome-shell-extensions-extensions');
}

function enable() {
    _extensionIndicator = new ExtensionsManager();
}

function disable() {
    _extensionIndicator.destroy();
}
