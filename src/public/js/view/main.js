

define([

	'underscore',
	'backbone',
	'marionette',
	'bootstrap',
	'templates',
	'leaflet',

	'view/loginModal',
	'view/userColumn',
	'view/linkColumn',
	'view/contribColumn',
	'view/editSettingColumn',
	'view/editPoiColumn',
	'view/editTileColumn',
	'view/tipOfTheDay',
],
function (

	_,
	Backbone,
	Marionette,
	Bootstrap,
	templates,
	L,

	LoginModalView,
	UserColumnView,
	LinkColumnView,
	ContribColumnView,
	EditSettingColumnView,
	EditPoiColumnView,
	EditTileColumnView,
	TipOfTheDayView
) {

	'use strict';

	return Marionette.LayoutView.extend({

		template: JST['main.html'],

		ui: {

			'map': '#main_map',
			'toolbarButtons': '.toolbar .toolbar_btn',

			'controlToolbar': '#control_toolbar',
			'zoomInButton': '#control_toolbar .zoom_in_btn',
			'zoomOutButton': '#control_toolbar .zoom_out_btn',
			'locateButton': '#control_toolbar .locate_btn',
			'locateWaitButton': '#control_toolbar .locate_wait_btn',
			'expandScreenButton': '#control_toolbar .expand_screen_btn',
			'compressScreenButton': '#control_toolbar .compress_screen_btn',
			'controlPoiButton': '#control_toolbar .poi_btn',
			'controlTileButton': '#control_toolbar .tile_btn',

			'userToolbar': '#user_toolbar',
			'loginButton': '#user_toolbar .login_btn',
			'userButton': '#user_toolbar .user_btn',
			'linkButton': '#user_toolbar .link_btn',
			'contribButton': '#user_toolbar .contrib_btn',
			'editButton': '#user_toolbar .edit_btn',

			'helpToolbar': '#help_toolbar',
			'helpButton': '#help_toolbar .help_btn',

			'editToolbar': '#edit_toolbar',
			'editSettingButton': '#edit_toolbar .setting_btn',
			'editPoiButton': '#edit_toolbar .poi_btn',
			'editTileButton': '#edit_toolbar .tile_btn',
		},

		regions: {

			'loginModal': '#rg_login_modal',

			'userColumn': '#rg_user_column',
			'linkColumn': '#rg_link_column',
			'contribColumn': '#rg_contrib_column',
			'editSettingColumn': '#rg_edit_setting_column',
			'editPoiColumn': '#rg_edit_poi_column',
			'editTileColumn': '#rg_edit_tile_column',

			'tipOfTheDay': '#rg_tip_of_the_day',
		},

		events: {

			'click @ui.zoomInButton': 'onClickZoomIn',
			'click @ui.zoomOutButton': 'onClickZoomOut',
			'click @ui.locateButton': 'onClickLocate',
			'click @ui.locateWaitButton': 'onClickLocateWait',
			'click @ui.expandScreenButton': 'onClickExpandScreen',
			'click @ui.compressScreenButton': 'onClickCompressScreen',

			'click @ui.loginButton': 'onClickLogin',
			'click @ui.userButton': 'onClickUser',
			'click @ui.linkButton': 'onClickLink',
			'click @ui.contribButton': 'onClickContrib',
			'click @ui.editButton': 'onClickEdit',
			'click @ui.editSettingButton': 'onClickEditSetting',
			'click @ui.editPoiButton': 'onClickEditPoi',
			'click @ui.editTileButton': 'onClickEditTile',
		},

		initialize: function () {

			var self = this;

			this._radio = Backbone.Wreqr.radio.channel('global');
		},

		onRender: function () {

			var self = this;


			this.ui.toolbarButtons.tooltip({

				'container': 'body',
				'delay': {

					'show': 500,
					'hide': 0
				}
			})
			.on('click', function () {

				$(this).blur();
			});



			if ( this._radio.reqres.request('var', 'isLogged') ) {

				var user = this._radio.reqres.request('model', 'user'),
				avatar = user.get('avatar'),
				letters = user.get('displayName')
				.toUpperCase()
				.split(' ')
				.splice(0, 3)
				.map(function (name) {

					return name[0];
				})
				.join('');

				if (letters.length > 3) {

					letters = letters[0];
				}


				if (avatar) {

					this.ui.userButton
					.addClass('avatar')
					.html('<img src="'+ avatar +'" alt="'+ letters +'">');
				}
				else {

					this.ui.userButton
					.removeClass('avatar')
					.html(letters);
				}

				this.ui.loginButton.addClass('hide');
				this.ui.userButton.removeClass('hide');
			}
			else {

				this.ui.loginButton.removeClass('hide');
				this.ui.userButton.addClass('hide');
			}


			this._userColumnView = new UserColumnView();
			this._linkColumnView = new LinkColumnView();
			this._contribColumnView = new ContribColumnView();
			this._editSettingColumnView = new EditSettingColumnView();
			this._editPoiColumnView = new EditPoiColumnView();
			this._editTileColumnView = new EditTileColumnView();

			this.getRegion('userColumn').show( this._userColumnView );
			this.getRegion('linkColumn').show( this._linkColumnView );
			this.getRegion('contribColumn').show( this._contribColumnView );
			this.getRegion('editSettingColumn').show( this._editSettingColumnView );
			this.getRegion('editPoiColumn').show( this._editPoiColumnView );
			this.getRegion('editTileColumn').show( this._editTileColumnView );

			this.getRegion('tipOfTheDay').show( new TipOfTheDayView() );



			if ( !document.fullscreenEnabled) {

				this.ui.expandScreenButton.addClass('hide');
				this.ui.compressScreenButton.addClass('hide');
			}

			$(window).on('fullscreenchange', function () {

				if ( document.fullscreenElement ) {

					self.onExpandScreen();
				}
				else {

					self.onCompressScreen();
				}
			});
		},

		onShow: function () {

			var self = this;

			this._map = L.map(this.ui.map[0], { 'zoomControl': false });

			this._map
			.setView([44.82921, -0.5834], 12)
			.on('locationfound', function () {

				self.onLocationFound();
			})
			.on('locationerror', function () {

				self.onLocationError();
			});


			L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

				'attribution': '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			})
			.addTo(this._map);
		},

		onClickZoomIn: function () {

			this._map.zoomIn();
		},

		onClickZoomOut: function () {

			this._map.zoomOut();
		},

		onClickLocate: function () {

			this.ui.locateButton.addClass('hide');
			this.ui.locateWaitButton.removeClass('hide');

			this._map.locate({

				'setView': true,
				'enableHighAccuracy': true,
				'maximumAge': 60 * 1000, // 60 seconds
			});
		},

		onClickLocateWait: function () {

			this._map.stopLocate();
		},

		onLocationFound: function () {

			this.ui.locateWaitButton.addClass('hide');
			this.ui.locateButton.removeClass('hide');
		},

		onLocationError: function () {

			this.ui.locateWaitButton.addClass('hide');
			this.ui.locateButton.removeClass('hide');
		},

		onClickExpandScreen: function () {

			document.documentElement.requestFullscreen();
		},

		onClickCompressScreen: function () {

			document.exitFullscreen();
		},

		onExpandScreen: function () {

			this.ui.expandScreenButton.addClass('hide');
			this.ui.compressScreenButton.removeClass('hide');
		},

		onCompressScreen: function () {

			this.ui.compressScreenButton.addClass('hide');
			this.ui.expandScreenButton.removeClass('hide');
		},

		onClickLogin: function () {

			var self = this;

			this._loginModalView = new LoginModalView();

			this.getRegion('loginModal').show( this._loginModalView );
		},

		onClickUser: function () {

			this._userColumnView.open();
		},

		onClickLink: function () {

			this._linkColumnView.open();
		},

		onClickContrib: function () {

			this._contribColumnView.open();
		},

		onClickEdit: function () {

			this.ui.editToolbar.toggleClass('open');
		},

		onClickEditSetting: function () {

			this._editSettingColumnView.open();
		},

		onClickEditPoi: function () {

			this._editPoiColumnView.open();
		},

		onClickEditTile: function () {

			this._editTileColumnView.open();
		},
	});
});
