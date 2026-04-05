// import electron and assets
const { app, BrowserWindow, nativeImage } = require('electron');
const path = require('path');
const assets = require('./assets.js');

// create window
function createWindow() {
  const icon = nativeImage.createFromDataURL(assets.iconValue);
  const win = new BrowserWindow({
    width: 400,
    height: 400,
    autoHideMenuBar: true,
    title: "Little Amethyst",
    icon: icon,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);