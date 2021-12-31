import {app, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions, shell, WebContents} from 'electron'
import {join} from "path";
import {ConnectionManager} from "./core/connection/ConnectionManager";
import {cleanLogs} from "./core/logs";
import {readLocal} from "./common/resources";

// const isDev = require('electron-is-dev');
// if (isDev) {
//     console.log('Running in development');
// } else {
//     require('update-electron-app')()
// }

let connectionManager = new ConnectionManager()

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        useContentSize: false,
        height: 720,
        webPreferences: {
            //preload: join(__dirname, './index-preload.ts'),
            nodeIntegration: true,
            contextIsolation: false,
        },
        width: 1280
    })

    // and load the index.html of the app.
    mainWindow.loadFile(join(__dirname, '../html/index.html')).then(() => {
        createMenu(mainWindow.webContents)
    })

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
}

function createMenu(webContents: WebContents) {
    const isMac = process.platform === 'darwin'
    const template: MenuItemConstructorOptions[] = [
        // { role: 'appMenu' }
        isMac
            ? {
                label: app.name,
                submenu: [
                    {role: 'minimize'},
                    {role: 'hide'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'services'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            }
            : {
                label: app.name,
                submenu: [
                    {role: 'minimize'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            },
        // {role: 'editMenu'},
        {role: 'viewMenu'},
        {
            label: readLocal('core.menu.connection'),
            id: 'connectionmenu',
            submenu: [
                {
                    label: readLocal('core.menu.connection.refresh'), id: 'reconnect',
                    click: async () => webContents.send('ui-sidebar-refresh-button')
                },
                {type: 'separator'},
                {
                    label: readLocal('core.menu.connection.add'), id: 'connect',
                    click: async () => webContents.send('ui-sidebar-add-button')
                },
                {
                    label: readLocal('core.menu.connection.delete'), id: 'disconnect',
                    click: async () => webContents.send('ui-sidebar-x-button')
                },
            ]
        },
        {
            label: readLocal('core.menu.task'),
            id: 'taskmenu',
            submenu: [
                {label: readLocal('core.menu.task.list'), click: async () => webContents.send('ui-open-list-tab')},
                {type: 'separator'},
                {
                    label: readLocal('core.menu.task.config'),
                    click: async () => webContents.send('ui-open-config-tab', {mode: 'create'})
                },
                {
                    label: readLocal('core.menu.task.timer'),
                    click: async () => webContents.send('ui-open-timer-tab', {mode: 'create'})
                },
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: readLocal('core.menu.learn', 'Electron'),
                    click: async () => await shell.openExternal('https://electronjs.org')
                },
                {
                    label: readLocal('core.menu.learn', 'Bootstrap'),
                    click: async () => await shell.openExternal('https://getbootstrap.com/')
                },
                {type: 'separator'},
                {
                    label: readLocal('core.menu.about'),
                    click: async () => await shell.openExternal('https://github.com/FrierenZk/wire.keeper2.ts')
                }
            ]
        }
    ]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    connectionManager.init()
    ipcMain.handle('core-call-self-event', async (event, channel, ...args: any[]) => {
        event.sender.send(channel, args)
    })
    ipcMain.handle('core-get-version', async (_) => {
        return app.getVersion()
    })
    createWindow()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('before-quit', () => {
    connectionManager.close()
    cleanLogs()
})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.