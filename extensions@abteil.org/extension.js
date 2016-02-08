const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const ExtensionSystem = imports.ui.extensionSystem;
const ExtensionUtils = imports.misc.extensionUtils;

function Extensions() {
	this.button = new PanelMenu.Button(0.0);
	
	let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
	let icon = new St.Icon({icon_name: 'goa-panel-symbolic', style_class: 'system-status-icon'});
	hbox.add_child(icon);

	this.button.actor.add_actor(hbox);
	this.button.actor.add_style_class_name('panel-status-button');

	this.button.actor.connect('button-press-event', Lang.bind(this, function() {
		this.refresh();
	}));
	
	Main.panel.addToStatusArea('extensions', this.button);
}

Extensions.prototype = {
	refresh: function() {
		this.button.menu.removeAll();
		let uuids = Object.keys(ExtensionUtils.extensions)
		uuids.forEach(Lang.bind(this, function(uuid) {
			let active = (ExtensionSystem.getEnabledExtensions().indexOf(uuid) > -1);
			let extension = ExtensionUtils.extensions[uuid];
			//let item = new PopupMenu.PopupSwitchMenuItem(uuid, true);
			let item = new PopupMenu.PopupSwitchMenuItem(extension.metadata.name, active);
			this.button.menu.addMenuItem(item);
		
			item.connect('toggled', function() {
				if(active)
					ExtensionSystem.disableExtension(uuid)
				else
					ExtensionSystem.enableExtension(uuid)
			});
		}));
		if(uuids.length > 0)
	        this.button.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
        let item = new PopupMenu.PopupMenuItem(_("Add gnome shell extensions ..."));
        //item.connect('activate', Lang.bind(this, this.openSettings));
        this.button.menu.addMenuItem(item);
	},

	destroy: function() {
		this.button.destroy();
	}
};

function init() {
}

var extensions;

function enable() {
	extensions = new Extensions();
}

function disable() {
	extensions.destroy();
}