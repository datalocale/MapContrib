

define([

    'underscore',
    'backbone',
    'marionette',
],
function (

    _,
    Backbone,
    Marionette
) {

    'use strict';

    return Marionette.Behavior.extend({

        defaults: {

            'destroyOnClose': false,
        },

        ui: {

            'closeBtn': '.close_btn',
        },

        events: {

            'click @ui.closeBtn': 'onClickClose',
            'keyup': 'onKeyUp',
        },

        initialize: function (options) {

            var self = this;

            this._radio = Backbone.Wreqr.radio.channel('global');

            this.listenTo(this._radio.vent, 'column:closeAll', this.onClose);

            this._isOpened = false;
        },

        onRender: function () {

            this.ui.column.attr('tabindex', 0);
        },

        onDestroy: function () {

            this.stopListening(this._radio.vent, 'column:closeAll');
        },

        onToggle: function () {

            if ( this._isOpened ) {

                this.onClose();
            }
            else {

                this.onOpen();
            }
        },

        onOpen: function () {

            var self = this;

            this._isOpened = true;

            if (this.view.onBeforeOpen) {

                this.view.onBeforeOpen();
            }

            window.requestAnimationFrame(function () {

                self.ui.column.addClass('open').focus();

                if (self.view.onAfterOpen) {

                    self.view.onAfterOpen();
                }
            });
        },

        onClose: function () {

            var self = this,
            mapElement = this._radio.reqres.request('map')._container;

            this._isOpened = false;

            $(mapElement).focus();

            if (this.view.onBeforeClose) {

                this.view.onBeforeClose();
            }

            window.requestAnimationFrame(function () {

                self.ui.column.on('transitionend', function () {

                    if (self.view.onAfterClose) {

                        self.view.onAfterClose();
                    }

                    if ( self.options.destroyOnClose ) {

                        self.view.destroy();
                    }
                })
                .removeClass('open');
            });
        },

        onClickClose: function () {

            this.onClose();
        },

        onKeyUp: function (e) {

            switch ( e.keyCode ) {

                case 27:

                    this.onClose();
                    break;
            }
        },
    });
});
