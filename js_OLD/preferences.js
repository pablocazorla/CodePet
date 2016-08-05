(function() {
	"use strict";
	/**
	 * List of availables ui_colors for UI
	 * @array
	 */
	var uiColorsAvailables = [{
		title: 'Light',
		val: 'light'
	}, {
		title: 'Dark',
		val: 'dark'
	}];

	/**
	 * List of availables code_themes for codes
	 * @array
	 */
	var codeThemesAvailables = [{
		title: 'Textual',
		val: 'textual'
	}, {
		title: 'Claire',
		val: 'claire'
	}, {
		title: 'Molokai',
		val: 'molokai'
	}];



	/**
	 * preferences Viewmodel
	 * @constructor
	 * @return {object} snippetVM
	 */
	SnippetApp.preferencesVM = (function() {

		/* VM TO RETURN ***********************************************/
		var vm = {
			username: ko.observable(),
			email: ko.observable(),
			ui_color: ko.observable(),
			code_theme: ko.observable(),
			uiColorsAvailables: uiColorsAvailables,
			codeThemesAvailables: codeThemesAvailables,
			shown: ko.observable(false),
			onReady: ko.observable(0),
			editingPassword: ko.observable(false),
			setPassFocus: ko.observable(false),
			setUsernameFocus: ko.observable(false),
			oldPassword: ko.observable(),
			newPassword: ko.observable(),
			newPasswordRepeat: ko.observable(),
			saveBtnText: ko.observable('Save'),
			saving: ko.observable(false)
		};

		var cacheData = {
			username: '',
			email: '',
			ui_color: '',
			code_theme: ''
		};
		var readyCount = 0; // Ready counter for execute onReady

		var resetPassEdition = function() {
			vm.editingPassword(false);
			vm.oldPassword('');
			vm.newPassword('');
			vm.newPasswordRepeat('');
		};

		vm.update = function() {
			SnippetApp.ajax('classes/user/get.php', {
				'userData': true
			}, function(data) {
				var d = data[0];
				vm.username(d.username);
				vm.email(d.email);
				vm.ui_color(d.ui_color);
				vm.code_theme(d.code_theme);
				readyCount++;
				vm.onReady(readyCount);
			});
		};

		vm.show = function() {
			for (var a in cacheData) {
				cacheData[a] = vm[a]();
			};
			vm.shown(true);
			vm.setUsernameFocus(true);
		};
		vm.hide = function() {
			if (!vm.saving()) {
				vm.shown(false);
				setTimeout(function() {
					for (var a in cacheData) {
						vm[a](cacheData[a]);
					};
					resetPassEdition();
				}, 400);
			}
		};


		vm.editPassword = function() {
			vm.editingPassword(true);
			vm.setPassFocus(true);
		};

		vm.save = function() {
			var toUpdate = {},
				anyToUpdate = false;
			for (var a in cacheData) {
				if (cacheData[a] != vm[a]()) {
					toUpdate[a] = vm[a]();
					anyToUpdate = true;
				}
			};
			if (anyToUpdate) {				
				vm.saving(true);
				toUpdate['userUpdate'] = true;

				//toUpdate['oldpassword'] = '123456';
				//toUpdate['newpassword'] = 'sdfsdfsdf';



				SnippetApp.ajax('classes/user/post.php', toUpdate, function(d) {
					vm.saving(false);
					vm.shown(false);
					setTimeout(function() {
						vm.saveBtnText('Save');
						resetPassEdition();
					}, 400);

				});
			} else {
				vm.hide();
			}
		};



		vm.init = function() {
			ko.applyBindings(vm, document.getElementById('preferencesVM'));
			vm.update();
		};

		return vm;
	})();
})();