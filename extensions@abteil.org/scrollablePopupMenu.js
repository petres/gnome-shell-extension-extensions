const BoxPointer = imports.ui.boxpointer;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const ScrollablePopupMenu = new Lang.Class({
    Name: 'ScrollablePopupMenu',
    Extends: PopupMenu.PopupMenu,

    _init: function(sourceActor, arrowAlignment, arrowSide) {
        PopupMenu.PopupMenuBase.prototype._init.call(this, sourceActor, 'popup-menu-content');
        this._arrowAlignment = arrowAlignment;
        this._arrowSide = arrowSide;

        this._boxPointer = new BoxPointer.BoxPointer(arrowSide, {
            x_fill: true,
            y_fill: true,
            x_align: St.Align.START
        });

        this.actor = this._boxPointer.actor;

        this.scroller = new St.ScrollView({
            hscrollbar_policy: Gtk.PolicyType.NEVER,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC
        });

        this.boxlayout = new St.BoxLayout({
            vertical: true
        });

        this.scroller.add_actor(this.box);
        this.boxlayout.add(this.scroller);

        this.bottomSection = new St.BoxLayout({
            vertical: true,
            style_class: 'bottomSection'
        });

        this.bottomSection.set_style('padding-bottom: 12px');

        this.boxlayout.add(this.bottomSection);

        this.actor._delegate = this;
        this.actor.style_class = 'popup-menu-boxpointer';

        this._boxPointer.bin.set_child(this.boxlayout);
        this.actor.add_style_class_name('popup-menu');

        this.box.set_style('padding-bottom: 0');
    }
});
