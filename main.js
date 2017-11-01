const electron = require('electron');
const url = require('url');
const path = require('path');

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = electron;

// set environment
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function() {
  // Create new window
  mainWindow = new BrowserWindow({});

  // Load HTML file into the window
  // e.g: file://shopping-list/mainWindow.html
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file',
    slashes: true
  }));

  // Quit app when closed
  mainWindow.on('closed', function() {
      app.quit();
  })

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  // TODO: don't quit on darwin
});

// Check for platform
const acceleratorPrefix = process.platform == 'darwin' ? 'Command' : 'Ctrl';

// Create menu template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        accelerator: `${acceleratorPrefix}+N`,
        click() {
          menuHandlers.createAddWindow();
        }
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label: 'Exit',
        accelerator: `${acceleratorPrefix}+Q`,
        click() {
          app.quit();
        }
      }
    ]
  }
]

// if mac, add empty object to begining of menu array
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
}

// Add developer tools if not production
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle Dev Tools',
        accelerator: `${acceleratorPrefix}+I`,
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}

// Menu Handlers
const menuHandlers = {
  createAddWindow() {
    // Create new windwo
    addWindow = new BrowserWindow({
      width: 300,
      height: 200,
      title: 'Add Shopping List Item'
    });
    // Load html into window
    addWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'addWindow.html'),
      protocol: 'file',
      slahses: true
    }));
    // Garbage collection
    addWindow.on('close', function() {
      addWindow = null;
    });
  }
}

// Catch item:add
ipcMain.on('item:add', function(e, item) {
  console.log(item)
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
})
