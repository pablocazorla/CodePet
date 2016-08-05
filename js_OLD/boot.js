SnippetApp = (function() {
	"use strict";
	var app = {};

	app.ajax = function(url, parameters, callback) {
		var t = (url.indexOf('post.php') >= 0) ? 'POST' : 'GET';
		var cbk = callback || function() {};
		$.ajax({
			type: t,
			url: url,
			data: parameters,
			success: function(data) {
				if (data == 'logout') {
					window.location.href = 'login.php';
				}
				cbk(data);
			}
		});
	};

	app.updateScroll = function() {
		// Nicescroll
		$('.scroller').niceScroll({
			cursorcolor: "#BBB", // change cursor color in hex
			cursoropacitymin: 0,
			cursoropacitymax: .8,
			cursorborder: "",
			//autohidemode:'leave',
			cursorfixedheight: 80,
			background: "rgba(255,255,255,.5)",
			horizrailenabled: false
		});
	};

	app.logout = function(){
		window.location.href = 'classes/user/logout.php';
	};

	return app;
})();