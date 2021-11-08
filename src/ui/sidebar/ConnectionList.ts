import {ListItemGroup} from "./ListItemGroup";
import {ipcRenderer} from "electron";
import {showAlert, showConfirmModal} from "../../index-renderer";
import {readLocal} from "../../common/resources";

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
        ipcRenderer.on('ui-get-connections-reply', ((event, args) => this.buildList(Array.from(args))))
        ipcRenderer.send('core-get-connections')
        return fragment
    }

    public refresh() {
        this.map.get(this.select)?.tryConnect()
    }

    public delete() {
        if (this.select.trim().length > 0)
            showConfirmModal(readLocal('ui.sidebar.delete.title', this.select.trim()), () => {
                ipcRenderer.send('core-delete-connection', this.select.trim())
            })
        else showAlert(readLocal('ui.sidebar.delete.alert'))
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