

define([

    'underscore',
    'backbone',
    'settings',
    'model/poiLayer',
],
function (

    _,
    Backbone,
    settings,
    poiLayerModel
) {

    'use strict';

    return Backbone.Collection.extend({

        url: function () {

            return settings.apiPath + 'theme/'+ this.options.themeId +'/poiLayers';
        },

        model: poiLayerModel,

        comparator: 'order',

        initialize: function (models, options) {

            this.options = options;

            this.on('add', this.onAdd);
        },

        onAdd: function (model) {

            if (model.get('_id')) {

                return;
            }

            var max_order_model = _.max( this.models, function (model) {

                return model.get('order') || 0;
            }),
            max_order = (max_order_model.get('order') || 0);

            model.set('order', max_order + 1);
        },


        /**
         * Returns an array of all the visible layers.
         *
         * @author Guillaume AMAT
         * @return An array of all the visible layers
         */
        getVisibleLayers: function () {

            return this.where({ 'visible': true });
        },
    });
});
