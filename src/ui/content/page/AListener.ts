import {ipcRenderer, IpcRendererEvent} from "electron";

abstract class AListener {
    protected rendererListeners: Map<string, Array<(event: IpcRendererEvent, args: any) => void>> = new Map()
    protected normalListeners: Array<(_: string) => void> = []

    protected bindRendererListeners(channel: string, func: (event: IpcRendererEvent, args: any) => void) {
        if (!this.rendererListeners.has(channel)) this.rendererListeners.set(channel, [])
        this.rendererListeners.get(channel)!.push(func)
        ipcRenderer.on(channel, func)
    }

    protected removeRendererListeners() {
        this.rendererListeners.forEach((value, key) =>
            value.forEach(func => ipcRenderer.removeListener(key, func)))
    }

    protected bindNormalListeners(fn: (_: string) => void) {
        this.normalListeners.push(fn)
    }

    protected removeNormalListeners() {
        this.normalListeners = []
    }
}

export {AListener}