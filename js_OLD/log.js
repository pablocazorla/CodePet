(function() {
	"use strict";

	var vm = {};

	vm.username = ko.observable().extend({
		required: {
			message: 'Please, enter your User Name'
		},
		minLength: 3
	});
	vm.password = ko.observable().extend({
		required: {
			message: 'Please, enter your Password'
		},
		minLength: 6
	});

	vm.errorLogin = ko.observable(false);


	vm.errors = ko.validation.group(vm);

	vm.subm = function() {
		if (vm.errors().length === 0) {
			jQuery.post('classes/user/log.php', {
				'username': vm.username(),
				'password': vm.password()
			}, function(isLogged) {
				if(isLogged == 'true'){
					var url = window.location.href.replace('login.php','');
					window.location.href = url;
				}else{
					vm.errorLogin(true);
				}
			});
		} else {
			vm.errors.showAllMessages();
		}
	};

	vm.hideErrorLogin = function(){
		vm.errorLogin(false);
	};



	ko.applyBindings(vm);

})();