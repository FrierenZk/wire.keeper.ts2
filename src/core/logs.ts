import {mkdirIfNotExist, prefixPath} from "../common/path";
import {setInterval} from "timers";
import {appendFile, readFileSync, rmdirSync, statSync, writeFileSync} from 'fs'
import {dialog, ipcMain} from "electron";
import {readLocal} from "../common/resources";

mkdirIfNotExist("./data/tmp")

let files = new Set<string>()

function randomName(): string {
    let r = () => Math.trunc((Math.random() * 10e12)).toString(36) + Math.trunc((Math.random() * 10e12)).toString(36)
    let name = ""
    do {
        name = r()
    } while (files.has(name))
    files.add(name)
    return name
}

function buildHTML(arr: Array<string>): string {
    let html = ""
    arr.forEach(value => {
        if (value.search(new RegExp(' error', 'i')) >= 0) html += `<p>${value.fontcolor('#dc3545')}</p>\r\n`
        else html += `<p>${value}</p>\r\n`
    })
    return html
}

class LogsWriter {
    protected buffer = new Array<string>()
    protected files = new Array<string>()
    protected host: string
    protected task: string

    constructor(host: string, task: string) {
        this.host = host
        this.task = task
        setInterval(async () => {
            if (this.buffer.length > 0) {
                let data = buildHTML(this.buffer)
                this.buffer = []
                // if (current == host + '_' + task) BrowserWindow.fromId(1)?.webContents.send('ui-table-append-logs', data)
                let file = prefixPath('./data/tmp/' + this.loadLatestFile())
                appendFile(file, data, err => {
                    if (err) console.error(err)
                    else if (statSync(file).size > 1024 * 1024)
                        this.createNewFile()
                })
            }
        }, 100)
    }

    public get allLogs() {
        let arr: Array<string> = []
        this.files.forEach(value => {
            try {
                arr.push(readFileSync(prefixPath('./data/tmp/' + value)).toString())
            } catch (e) {
                console.warn(e)
            }
        })
        return arr
    }

    public append(msg: string) {
        this.buffer.push(msg)
    }

    public clear() {
        this.files = []
    }

    protected loadLatestFile(): string {
        if (this.files.length > 0) {
            return this.files[this.files.length - 1]
        } else return this.createNewFile()
    }

    protected createNewFile(): string {
        let name = randomName() + '.html'
        this.files.push(name)
        return name
    }
}

let writers = new Map<string, Map<string, LogsWriter>>()

async function appendLogs(msg: string, task: string, host: string) {
    if (!writers.has(host)) writers.set(host, new Map())
    if (!writers.get(host)!.has(task)) writers.get(host)!.set(task, new LogsWriter(host, task))
    writers.get(host)!.get(task)!.append(msg)
}

ipcMain.handle('core-get-logs', ((event, host, task) => {
    return writers?.get(host)?.get(task)?.allLogs || []
}))

ipcMain.handle('core-clear-logs', ((event, host, task) => {
    if (writers.has(host)) if (writers.get(host)!.has(task)) writers.get(host)?.get(task)?.clear()
}))

ipcMain.handle('core-save-logs', ((event, host, task) => {
    let writer = writers.get(host)?.get(task)
    dialog.showSaveDialog({
        title: readLocal('core.logs.save.dialog.title'),
        defaultPath: `${task}`,
        filters: [{name: 'Text Files', extensions: ['txt']}, {name: 'All Files', extensions: ['*']}]
    }).then(r => {
        if (r?.filePath)
            writeFileSync(r.filePath, writer?.allLogs.join('\r\n')
                .replace(/<[^>]+>/g, '') || '')
    })
}))

function cleanLogs() {
    rmdirSync(prefixPath('./data/tmp'), {
        recursive: true
    })
}

export {appendLogs, cleanLogs}