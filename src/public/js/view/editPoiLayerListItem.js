

define([

    'underscore',
    'backbone',
    'settings',
    'ui/map',
],
function (

    _,
    Backbone,
    settings,
    MapUi
) {

    'use strict';

    return Marionette.ItemView.extend({

        template: JST['editPoiLayerListItem.html'],

        tagName: 'a',

        className: 'list-group-item',

        attributes: {

            'href': '#',
        },

        modelEvents: {

            'change': 'render'
        },

        ui: {

            'remove_btn': '.remove_btn'
        },

        events: {

            'click': 'onClick',
            'click @ui.remove_btn': 'onClickRemove',
        },

        initialize: function () {

            var self = this;

            this._radio = Backbone.Wreqr.radio.channel('global');
        },

        templateHelpers: function () {

            return {

                'marker': MapUi.buildPoiLayerHtmlIcon( this.model ),
            };
        },

        onRender: function () {

            this.el.id = 'poi-layer-'+ this.model.cid;
        },

        onClick: function () {

            this._radio.commands.execute( 'column:showPoiLayer', this.model );
        },

        onClickRemove: function (e) {

            e.stopPropagation();

            this.model.destroy();
        },
    });
});
