import {mkdirIfNotExist, prefixPath} from "../common/path";
import {setInterval} from "timers";
import {appendFile, statSync, rmdirSync} from 'fs'
import {ipcMain} from "electron";

mkdirIfNotExist("./data/tmp")

let files = new Set<string>()
// let current: string = ""

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
        }, 200)
    }

    public get allFiles() {
        return this.files
    }

    public append(msg: string) {
        this.buffer.push(msg)
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
    // current = host + '_' + task
    if (!writers.has(host)) return []
    if (!writers.get(host)!.has(task)) return []
    return writers.get(host)!.get(task)!.allFiles
}))

function cleanLogs() {
    rmdirSync(prefixPath('./data/tmp'), {
        recursive: true
    })
}

export {appendLogs, cleanLogs}