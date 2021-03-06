

define([

    'underscore',
    'backbone',
    'marionette',
    'bootstrap',
    'templates',
    'view/selectPoiLayerList',
],
function (

    _,
    Backbone,
    Marionette,
    Bootstrap,
    templates,
    SelectPoiLayerListView
) {

    'use strict';

    return Marionette.LayoutView.extend({

        template: JST['selectPoiColumn.html'],

        behaviors: {

            'l20n': {},
            'column': {},
        },

        regions: {

            'layerList': '.rg_layer_list',
        },

        ui: {

            'column': '#select_poi_column',
        },

        initialize: function () {

            var self = this;

            this._radio = Backbone.Wreqr.radio.channel('global');

            this._radio.commands.setHandler('column:selectPoiLayer:render', this.render.bind(this));
        },

        onRender: function () {

            var poiLayers = this._radio.reqres.request('poiLayers'),
            selectPoiLayerListView = new SelectPoiLayerListView({ 'collection': poiLayers });

            this.getRegion('layerList').show( selectPoiLayerListView );
        },

        onBeforeOpen: function () {

            this._radio.vent.trigger('column:closeAll');
            this._radio.vent.trigger('widget:closeAll');
        },

        open: function () {

            this.triggerMethod('open');
        },

        close: function () {

            this.triggerMethod('close');
        },
    });
});
