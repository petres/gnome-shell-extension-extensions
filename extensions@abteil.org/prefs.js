const GLib = imports.gi.GLib;

const { Gio, GObject, Gtk } = imports.gi;

const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;

const Gettext = imports.gettext;
const _ = Gettext.gettext;
const N_ = e => e;

const ExtensionsSettings = GObject.registerClass(
class ExtensionsSettings extends Gtk.Grid {

    _loadSettings() {
        this._positionCombo.set_active(this._settings.get_enum('position'))
        this._showAddCheckbox.set_active(this._settings.get_boolean('show-add'))
    }

    _init(params) {
        super._init(params);

        let _settingsInfo = {
            'position': {
                    'label': _('Position'),
                    'items': [
                        {
                            id: 0,
                            name: _("Panel")
                        },
                        {
                            id: 1,
                            name: _("Menu")
                        }
                    ]
                },
            'show-add': {
                    'label': _("Show 'Add ...'")
                }
        };

        // Gtk Grid init
        this.set_orientation(Gtk.Orientation.VERTICAL);
        this.set_row_spacing(10);
        this.margin = 20;

        // Open settings
        this._settings = ExtensionUtils.getSettings();
        this._settings.connect('changed', Lang.bind(this, this._loadSettings));

        // Position
        let positionLabel = new Gtk.Label({
                label:      _settingsInfo['position']['label'] + ": ",
                xalign:     0,
                hexpand:    true
            });

        let model = new Gtk.ListStore();
        model.set_column_types([GObject.TYPE_INT, GObject.TYPE_STRING]);

        this._positionCombo = new Gtk.ComboBox({model: model});
        this._positionCombo.get_style_context().add_class(Gtk.STYLE_CLASS_RAISED);

        let renderer = new Gtk.CellRendererText();
        this._positionCombo.pack_start(renderer, true);
        this._positionCombo.add_attribute(renderer, 'text', 1);

        for (let i = 0; i < _settingsInfo['position']['items'].length; i++) {
            let item = _settingsInfo['position']['items'][i];
            let iter = model.append();
            model.set(iter, [0, 1], [item.id, item.name]);
        }

        this._positionCombo.connect('changed', Lang.bind(this, function(entry) {
            let [success, iter] = this._positionCombo.get_active_iter()
            if (success)
                this._settings.set_enum('position', this._positionCombo.get_model().get_value(iter, 0));
        }));

        this.attach(positionLabel, 1, 1, 1, 1);
        this.attach_next_to(this._positionCombo, positionLabel, 1, 1, 1);

        // Show Add
        let showAddLabel = new Gtk.Label({
                label:      _settingsInfo['show-add']['label'] + ": ",
                xalign:     0,
                hexpand:    true
            });

        this._showAddCheckbox = new Gtk.Switch({ valign: Gtk.Align.CENTER, halign: Gtk.Align.CENTER });
        this._showAddCheckbox.connect('notify::active',  Lang.bind(this, function(button) {
            this._settings.set_boolean('show-add', button.active);
        }));

        this.attach(showAddLabel, 1, 2, 1, 1);
        this.attach_next_to(this._showAddCheckbox, showAddLabel, 1, 1, 1);

        this._loadSettings();

    }
});

function init() {
    ExtensionUtils.initTranslations('gnome-shell-extensions-extensions');
}

function buildPrefsWidget() {
    let widget = new ExtensionsSettings();
    widget.show_all();

    return widget;
}
