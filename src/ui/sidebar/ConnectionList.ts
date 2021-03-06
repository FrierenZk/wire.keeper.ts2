import {ListItemGroup} from "./ListItemGroup";
import {ipcRenderer} from "electron";
import {readLocal} from "../../common/resources";
import {ConfirmModal} from "../modal/ConfirmModal";
import {AlertToast} from "../toast/AlertToast";

class ConnectionList {
    protected list = document.createElement('div')
    protected map = new Map<string, ListItemGroup>()
    protected select = ''

    public create() {
        let fragment = document.createDocumentFragment()

        fragment.appendChild(this.list)
        this.list.className = 'd-flex flex-column mb-auto'
        this.list.style.overflow = 'auto'

        this.buildList(['test1', 'test2', 'test3'])
        ipcRenderer.on('ui-update-connections', (async (event, args) => this.buildList(Array.from(args))))
        ipcRenderer.invoke('core-get-connections').then(args => this.buildList(Array.from(args)))
        return fragment
    }

    public refresh() {
        this.map.get(this.select)?.tryConnect()
    }

    public delete() {
        if (this.select.trim().length > 0)
            new ConfirmModal(readLocal('ui.sidebar.delete.title', this.select.trim()), () => {
                ipcRenderer.invoke('core-delete-connection', this.select.trim()).then(r => {
                    if (r) ipcRenderer.invoke('core-get-connections').then(args => this.buildList(Array.from(args)))
                })
            }).show()
        else new AlertToast(readLocal('ui.sidebar.delete.alert')).show()
    }

    public filter(t: string) {
        this.map.forEach(value => value.filter(t))
    }

    public removeFilter() {
        this.map.forEach(value => value.removeFilter())
    }

    protected buildList(arr: Array<string>) {
        let remove = new Set(this.map.keys())
        arr.forEach(value => {
            if (remove.has(value)) remove.delete(value)
            else this.appendItem(value)
        })
        remove.forEach(value => this.removeItem(value))
    }

    protected appendItem(item: string) {
        let t = new ListItemGroup(item)
        t.onSelect = (value) => {
            this.select = value
        }
        this.map.set(item, t)
        this.list.appendChild(t.create())
    }

    protected removeItem(item: string) {
        this.map.get(item)?.remove()
        this.map.delete(item)
    }
}

export {ConnectionList}