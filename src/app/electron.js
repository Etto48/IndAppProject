const { app, BrowserWindow, session } = require('electron');
require('dotenv').config({
    // The GOOGLE_API_KEY is used only for the Electron app and is not needed in the web app or Android app.
    path: require('path').join(__dirname, '../.env.electron')
});

let mainWindow;

app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.commandLine.appendSwitch('disable-web-security', 'true');

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        console.log(`Permission requested: ${permission}`);
        callback(true); // Automatically grant permission
    });

    mainWindow.loadURL('https://127.0.0.1:4848');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // On certificate error we disable default behaviour (stop loading the page)
    // and we then say "it is all fine - true" to the callback
    event.preventDefault();
    callback(true);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});