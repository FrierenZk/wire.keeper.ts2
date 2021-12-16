import {clearInterval, setInterval} from "timers";
import {ipcMain} from "electron";
import {readLocal} from "../../common/resources";
import {readFile, renameSync, writeFileSync} from "fs";
import {mkdirIfNotExist, prefixPath} from "../../common/path";
import {parseArray, parseMap} from "../../common/parser";
import {Connection} from "./Connection";

class ConnectionManager {
    protected map: Map<string, Connection> = new Map()
    protected configTimer: NodeJS.Timeout | null = null

    public init() {
        this.initListeners()
        this.loadConfigs()
        this.configTimer = setInterval(this.saveConfigs, 10 * 1000)
    }

    public close() {
        if (this.configTimer) clearInterval(this.configTimer)
        this.saveConfigs().then()
    }

    protected initListeners() {
        ipcMain.handle('core-create-connection', async (event, args) => {
            if (this.map.has(args)) return readLocal('core.create.connection.duplicated', args)
            let f = this.createConnection(args)
            if (f) {
                event.sender.send('ui-update-connections', Array.from(this.map.keys()))
                return null
            } else return readLocal('core.create.connection.failed', args)
        })
        ipcMain.handle('core-delete-connection', async (event, args) => {
            let flag = this.map.has(args)
            if (flag) flag = flag && this.deleteConnection(args)
            if (flag) event.sender.send('ui-toast-show', readLocal('core.delete.connection.success', args))
            else event.sender.send('ui-toast-show', readLocal('core.delete.connection.failed', args))
            return flag
        })
        ipcMain.handle('core-get-connections', async (_) => {
            return Array.from(this.map.keys())
        })
    }

    protected createConnection(host: string, tasks: Map<string, Array<string>> | null = null): boolean {
        try {
            this.map.set(host, Connection.on(host, tasks))
            if (this.map.get(host)?.Host === host) return true
            else this.map.delete(host)
        } catch (e) {
            console.error(e)
        }
        return false
    }

    protected deleteConnection(host: string): boolean {
        this.map.get(host)?.destroy()
        this.map.delete(host)
        return !this.map.has(host)
    }

    protected loadConfigs() {
        readFile(prefixPath('./data/config/connection.json'), ((err, data) => {
            if (err) {
                console.error(err)
                return
            }
            parseArray(data.toString()).forEach(value => {
                try {
                    if (value.host)
                        if (value.task) this.createConnection(value.host, this.buildTask(JSON.stringify(value.task)))
                        else this.createConnection(value.host)
                    else console.error('Invalid json error')
                } catch (e) {
                    console.error(e)
                }
            })
        }))
    }

    protected async saveConfigs() {
        if (!this.map) return
        let arr: Array<string> = []
        this.map.forEach((value, _) => {
            arr.push(JSON.parse(value.toString()))
        })
        let data = JSON.stringify(arr, null, 2)
        if (data.trim().length > 0) {
            mkdirIfNotExist('./data/config')
            writeFileSync(prefixPath('./data/config/connection.json.tmp'), data)
            renameSync(prefixPath('./data/config/connection.json.tmp'), prefixPath('./data/config/connection.json'))
        }
    }

    protected buildTask(json: string): Map<string, Array<string>> {
        try {
            let map = new Map<string, Array<string>>()
            parseMap(json).forEach((value, key) => {
                map.set(key, Array.from(value))
            })
            return map
        } catch (e) {
            console.error(e)
        }
        return new Map()
    }
}

export {ConnectionManager}