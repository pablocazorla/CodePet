(function() {
	"use strict";

	/* NOTIFICATIONS ***********************************************/
	CodePet.notifications = (function() {
		var $trail,
			duration = 3000,
			fade = 600,
			vm = {};
		vm.fire = function(content) {
			var $n = $('<div class="notification">' + content + '</div>');
			$trail.prepend($n);
			setTimeout(function() {
				$n.css('margin-top', '0');
			}, 100);
			var hidding = false,
				hide = function() {
					if (!hidding) {
						hidding = true;
						$n.fadeOut(fade, function() {
							$n.remove();
						});
					}
				};
			setTimeout(hide, duration);
			$n.click(hide);
		};
		vm.init = function() {
			$trail = $('#notifications-trail');
		};
		return vm;
	})();
})();