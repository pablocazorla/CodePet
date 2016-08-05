;
(function() {
	"use strict";
	const ipc = require('electron').ipcRenderer;
	document.getElementById('window-frame-button-maximize').addEventListener('click', function() {
		ipc.send('toggle-maximize-window');
	});
	document.getElementById('window-frame-button-minimize').addEventListener('click', function() {
		ipc.send('minimize-window');
	});
	document.getElementById('window-frame-button-close').addEventListener('click', function() {
		window.close();
	});

	document.getElementById('window-frame-header').addEventListener('dblclick', function() {
		ipc.send('toggle-maximize-window');
	});

	var maximized = false,
		frame = document.getElementById('window-frame');

	ipc.on('maximized-window', function() {
		frame.className = 'maximized';
		maximized = true;
	});
	ipc.on('unmaximized-window', function() {
		frame.className = '';
		maximized = false;
	});
	ipc.on('move-window', function() {
		if(maximized){
			frame.className = '';
			maximized = false;
		}
	});
})();