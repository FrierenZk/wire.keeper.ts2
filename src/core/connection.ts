import * as io from 'socket.io-client'
import {ipcMain, IpcMainInvokeEvent} from "electron";
import {readLocal} from "../common/resources";
import {clearInterval, setInterval} from "timers";
import {readFile, renameSync, writeFileSync} from 'fs'
import {parseArray, parseMap, stringifyMap} from "../common/parser";
import {waitUntil} from "../common/coroutines";
import {mkdirIfNotExist, prefixPath} from "../common/path";
import {appendLogs} from "./logs";

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
        ipcMain.on('core-create-connection', async (event, args) => {
            let flag = !this.map.has(args)
            if (flag) flag = flag && this.createConnection(args)
            if (flag) {
                event.reply('ui-toast-show', readLocal('core.create.connection.success', args))
                event.reply('ui-update-connections', Array.from(this.map.keys()))
            } else event.reply('ui-toast-show-alert', readLocal('core.create.connection.failed', args))
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

class Connection {
    protected socket: SocketIOClient.Socket | null = null
    protected host: string = ''
    protected task: Map<string, Array<string>> = new Map()

    get Host(): string {
        return this.host
    }

    public static on(host: string, task: Map<string, Array<string>> | null = null): Connection {
        let conn = new Connection()
        conn.host = host
        if (task) task.forEach((value, key) => {
            conn.task.set(key, value.sort())
        })
        conn.init()
        return conn
    }

    public connected() {
        return this.socket ? this.socket.connect() : false
    }

    public destroy() {
        this.socket?.close()
        ipcMain.removeAllListeners('core-get-status:' + this.host)
        ipcMain.removeAllListeners('core-get-tasks:' + this.host)
        ipcMain.removeHandler('core-start-task:' + this.host)
        ipcMain.removeHandler('core-stop-task:' + this.host)
    }

    public toString(): string {
        if (this.host) return stringifyMap(new Map<string, any>([['host', this.host], ['task', this.task]]))
        else return ''
    }

    protected init() {
        if (this.host === '') throw 'Invalid connection host'
        let host = this.host.includes(':') && this.host.substr(this.host.lastIndexOf(':')).length > 0 ? this.host : this.host + ':21518'
        console.log(host)
        this.socket = io('http://' + host, {
            timeout: 5000,
            reconnection: true,
            transports: ['websocket'] //Unknown reason caused polling connection failed
        })
        this.socket.on('broadcast_logs', async (data: any) => {
            let obj = JSON.parse(data)
            let task = obj['name']
            let time = obj['time']
            let msg = obj['msg']
            if (task && time && msg) appendLogs(time.trim() + ': ' + msg.toString().trim(), task.toString(), this.host).then()
            else {
                console.warn(`Invalid logs received "${task}:${msg}"`)
            }
        })
        ipcMain.on('core-get-status:' + this.host, ((event) => {
            event.reply('ui-get-status-reply:' + this.host, this.connected())
        }))
        ipcMain.on('core-get-tasks:' + this.host, ((event) => {
            let t = false
            this.socket?.emit('get_config_list', async (data: string) => {
                let task = new Map<string, Array<string>>()
                parseMap(data).forEach((value, key) => {
                    if (!task.has(value)) task.set(value, [])
                    task.get(value)?.push(key)
                })
                this.task.clear()
                task.forEach((value, key) => {
                    this.task.set(key, value.sort())
                })
                t = true
            })
            waitUntil(() => {
                return t
            }, 3000).then(r => event.reply('ui-get-tasks-reply:' + this.host, this.task, r))
        }))
        ipcMain.handle('core-search-task:' + this.host, (async (event, args) => {
            let ret: string | null = null
            this.socket?.emit('get_relative_config', args, async (data: string) => {
                if (data.trim().length > 0) ret = data
                else console.warn(`Received empty with searching ${args}`)
            })
            await waitUntil(() => (ret != null), 3000)
            return ret
        }))
        ipcMain.handle('core-start-task:' + this.host, (event, args) => {
            this.socket?.emit('add_task', args, async (data: string) => {
                this.showToast(readLocal('core.connection.start.task.status', this.host, args, data),
                    () => data.trim() == 'Success', event)
            })
        })
        ipcMain.handle('core-start-task-force:' + this.host, (event, args) => {
            this.socket?.emit('add_task', JSON.stringify({name: args, extraParas: {force: true}}),
                async (data: string) => {
                    this.showToast(readLocal('core.connection.start.task.status', this.host, args, data),
                        () => data.trim() == 'Success', event)
                })
        })
        ipcMain.handle('core-get-task-info:' + this.host, (async (event, args) => {
            let ret: any | null = null
            this.socket?.emit('get_config', args, async (data: string) => {
                if (data.trim().length > 0) ret = JSON.parse(data)
            })
            await waitUntil(() => (ret != null), 3000)
            return ret
        }))
        ipcMain.handle('core-start-custom-task:' + this.host, async (event, args) => {
            this.socket?.emit('add_task', JSON.stringify({
                name: String(args.name),
                config: args
            }), async (data: string) => {
                this.showToast(readLocal('core.connection.start.task.status', this.host, args.name, data),
                    () => data.trim() == 'Success', event)
            })
        })
        ipcMain.handle('core-modify-config:' + this.host, async (event, args) => {
            this.socket?.emit('modify_config', JSON.stringify(args), async (data: string) => {
                this.showToast(readLocal('core.connection.modify.config.status', this.host, args.name, data),
                    () => data.trim() == 'Success', event)
            })
        })
        ipcMain.handle('core-create-config:' + this.host, async (event, args) => {
            this.socket?.emit('add_config', JSON.stringify(args), async (data: string) => {
                this.showToast(readLocal('core.connection.create.config.status', this.host, args.name, data),
                    () => data.trim() == 'Success', event)
            })
        })
        // ipcMain.handle('core-stop-task:' + this.host, ((event, args) => {
        //     this.socket?.emit('stop_task', args, async (data: string) => {
        //         let msg = readLocal('core.connection.stop.task.status', this.host, args, data)
        //         if (data.trim() == 'Success') event.sender.send('ui-toast-show', msg)
        //         else event.sender.send('ui-toast-show-alert', msg)
        //     })
        // }))
        // ipcMain.on('core-get-task-status:' + this.host, ((event, args) => {
        //     this.socket?.emit('get_task_status', args, async (data: string) => {
        //         if (data) event.sender.send('ui-get-task-status-reply:' + this.host, data)
        //     })
        // }))
    }

    protected showToast(msg: string, fn: () => boolean, event: IpcMainInvokeEvent) {
        if (fn()) event.sender.send('ui-toast-show', msg)
        else event.sender.send('ui-toast-show-alert', msg)
    }
}


export {ConnectionManager}