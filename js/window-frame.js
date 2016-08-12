;
(function() {
	"use strict";
	const clipboard = require('electron').clipboard;

	CodePet.setClipboard = function(content){
		clipboard.writeText(content);
	};
})();