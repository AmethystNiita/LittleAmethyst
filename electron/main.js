// import electron and assets
const { app, BrowserWindow, nativeImage, shell, dialog } = require('electron'); 
const path = require('path');
const https = require('https'); 
const assets = require('./assets.js');

// pull the version from package.json
const CURRENT_VERSION = require('./package.json').version;

// check for updates from GitHub
function checkForUpdates() {
  const options = {
    hostname: 'api.github.com',
    path: '/repos/AmethystNiita/LittleAmethyst/releases/latest',
    headers: { 'User-Agent': 'Little-Amethyst' }
  };

  https.get(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const release = JSON.parse(data);
        const latestVersion = release.tag_name.replace('v', '');
        if (latestVersion !== CURRENT_VERSION && isNewerVersion(CURRENT_VERSION, latestVersion)) {
          showUpdateDialog(release.html_url, release.tag_name);
        }
      } catch (error) {
        console.error("Failed to parse update data:", error);
      }
    });
  }).on('error', (err) => {
    console.error("Update check failed:", err);
  });
}

// compare version numbers
function isNewerVersion(current, latest) {
  const cArr = current.split('.').map(Number);
  const lArr = latest.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (lArr[i] > cArr[i]) return true;
    if (lArr[i] < cArr[i]) return false;
  }
  return false;
}

// show a cute system dialogue box asking to update
function showUpdateDialog(updateUrl, tagName) {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available!',
    message: `A new version (${tagName}) of Little Amethyst is waiting for you.`,
    detail: 'Would you like to visit the release page to install it now?',
    buttons: ['Yes, please!', 'Not now.'],
    defaultId: 0,
    cancelId: 1
  }).then((result) => {
    if (result.response === 0) {
      shell.openExternal(updateUrl);
    }
  });
}

// create window
function createWindow() {
  app.setAppUserModelId("Little Amethyst");
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
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  setTimeout(checkForUpdates, 3000);
}

// create window
app.setPath('userData', path.join(app.getPath('appData'), 'Little Amethyst'));
app.whenReady().then(createWindow);