import {ipcMain, IpcMainInvokeEvent} from "electron";
import {parseArray, parseMap, stringifyMap} from "../../common/parser";
import * as io from "socket.io-client";
import {appendLogs, getRecords} from "../logs";
import {waitUntil} from "../../common/coroutines";
import {readLocal} from "../../common/resources";

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
        let host = this.host.includes(':') && this.host.substring(this.host.lastIndexOf(':')).length > 0 ? this.host : this.host + ':21518'
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
            if (task && time && msg) {
                appendLogs(time.trim() + ': ' + msg.toString().trim(), task.toString(), this.host).then()
                if (!idMap.has(Number(task))) updateID(Number(task)).then()
            } else {
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
        ipcMain.handle('core-delete-config:' + this.host, async (event, args) => {
            this.socket?.emit('delete_config', args, async (data: string) => {
                this.showToast(readLocal('core.connection.delete.config.status', this.host, args.name, data),
                    () => data.trim() == 'Success', event)
            })
        })

        let idMap: Map<number, string> = new Map()
        let updateID = async (id: number) => {
            let name: string | null = null
            if (id) {
                this.socket?.emit('get_task_name', id, async (data: string) => name = data)
                await waitUntil(() => (name != null), 3000)
                if (name && name != 'null') {
                    idMap.set(id, name)
                    return name
                } else return idMap.get(id)
            } else return null
        }
        ipcMain.handle('core-get-task-name:' + this.host, async (event, args) => {
            return await updateID(Number(args))
        })

        ipcMain.handle('core-get-task-status:' + this.host, async (event, args) => {
            let status: string | null = null
            this.socket?.emit('get_task_status', Number(args), async (data: string) => status = data)
            await waitUntil(() => (status != null), 3000)
            if (status === null) status = 'Waiting for Server'
            return status
        })

        let taskConfigHis = new Map<string, string>()
        ipcMain.handle('core-get-task-config:' + this.host, async (event, args) => {
            let info: string | null = null
            this.socket?.emit('get_task_config', Number(args), async (data: string) => {
                info = data
                if (data !== 'null') taskConfigHis.set(args, data)
            })
            await waitUntil(() => (info != null), 3000)
            if (info === 'null' && taskConfigHis.has(args)) info = taskConfigHis.get(args)!
            return info
        })

        ipcMain.handle('core-stop-task:' + this.host, async (event, args) => {
            this.socket?.emit('stop_task', Number(args), (data: string) => {
                let task = idMap.get(Number(args)) ? idMap.get(Number(args))! : "unknown"
                this.showToast(readLocal('core.connection.stop.task.status', this.host, task, data),
                    () => data.trim() === 'Success', event)
            })
        })

        ipcMain.handle('core-get-task-list:' + this.host, async (event, _) => {
            let set: Set<string> | null = null
            this.socket?.emit('get_task_list', async (data: string) => {
                let s = new Set<string>()
                parseArray(data).forEach(value => s.add(String(value)))
                set = s
            })
            await waitUntil(() => (set != null), 3000)
            if (set === null) set = new Set()
            getRecords(this.host).forEach(value => set?.add(value))
            return Array.from(set ? set : [])
        })

        ipcMain.handle('core-get-timer-list:' + this.host, async (event, _) => {
            let arr: Array<any> | null = null
            this.socket?.emit('get_timer_list', async (data: string) => {
                arr = parseArray(data)
            })
            await waitUntil(() => (arr != null), 3000)
            return arr
        })
        ipcMain.handle('core-get-timer-config:' + this.host, async (event, args) => {
            let info: string | null = null
            this.socket?.emit('get_timer_config', String(args), async (data: string) => {
                info = data
            })
            await waitUntil(() => (info != null), 3000)
            return info
        })
        ipcMain.handle('core-delete-timer:' + this.host, async (event, args) => {
            this.socket?.emit('delete_ticker', String(args), async (data: string) => {
                this.showToast(readLocal('core.connection.delete.timer.status', this.host, args, data),
                    () => data.trim() === 'Success', event)
            })
        })
        ipcMain.handle('core-add-timer:' + this.host, async (event, args) => {
            this.socket?.emit('add_ticker', JSON.stringify(args), async (data: string) => {
                this.showToast(readLocal('core.connection.add.timer.status', this.host, args.name, data),
                    () => data.trim() === 'Success', event)
            })
        })
        ipcMain.handle('core-modify-timer:' + this.host, async (event, args) => {
            this.socket?.emit('modify_ticker', JSON.stringify(args), async (data: string) => {
                this.showToast(readLocal('core.connection.modify.timer.status', this.host, args.name, data),
                    () => data.trim() === 'Success', event)
            })
        })
    }

    protected showToast(msg: string, fn: () => boolean, event: IpcMainInvokeEvent) {
        if (fn()) event.sender.send('ui-toast-show', msg)
        else event.sender.send('ui-toast-show-alert', msg)
    }
}

export {Connection}