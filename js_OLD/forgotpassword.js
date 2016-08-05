(function() {
	"use strict";

	var vm = {};

	vm.email = ko.observable().extend({
		required: {
			message: 'Please, enter your Email'
		},
		minLength: 3,
		pattern: {
			message: 'Hey this doesnt match my pattern',
			params: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/
		}
	});

	vm.resultMessage = ko.observable('');

	vm.resultMessageVisible = ko.computed(function(){
		return vm.resultMessage().length > 0;
	});



	vm.errors = ko.validation.group(vm);



	vm.subm = function() {
		if (vm.errors().length === 0) {
			jQuery.post('classes/user/forgotpassword.php', {
				'email': vm.email()
			}, function(data) {
				if(data == 'true'){
					vm.resultMessage('We sent you an email with a link to reset your password.');
				}else{
					console.log(data);
					vm.resultMessage('The Email does not exist! Please, try again or register a new account.');
				}				
			});
		} else {
			vm.errors.showAllMessages();
		}
	};

	vm.hideErrorLogin = function() {
		vm.errorLogin(false);
	};



	ko.applyBindings(vm);

})();