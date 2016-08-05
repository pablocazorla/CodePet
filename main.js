const electron = require('electron');
const {
  app
} = electron;
const {
  BrowserWindow
} = electron;

const ipc = require('electron').ipcMain;

let win;

function createWindow() {

  //const {width,height} = electron.screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 1600,
    height: 950,
    transparent: true,
    frame: false,
    hasShadow: false
  });
  win.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  //win.webContents.openDevTools();

  win.on('maximize', function(event) {
    event.sender.send('maximized-window');
  });
  win.on('unmaximize', function(event) {
    event.sender.send('unmaximized-window');
  });
  win.on('move', function(event) {
    event.sender.send('move-window');
  });

  win.on('closed', () => {
    win = null;
  });
};
var maximizedWindow = false;
ipc.on('toggle-maximize-window', function(event) {
  if (maximizedWindow) {
    maximizedWindow = false;
    win.unmaximize();
  } else {
    maximizedWindow = true;
    win.maximize();
  }
});
ipc.on('minimize-window', function(event) {
  win.minimize();
});

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  if (process.platform !== 'darwin') {
    app.quit();
  }
  app.quit();
});
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});