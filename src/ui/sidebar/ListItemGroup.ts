import {ListItemElement} from "./ListItemElement";
import {randomId} from "../random";
import {ipcRenderer} from "electron";
import {readLocal} from "../../common/resources";
import {InfoToast} from "../toast/InfoToast";

class ListItemGroup {
    public onSelect: ((_: string) => void) | null = null
    protected name: string
    protected button = document.createElement('div')
    protected collapse = document.createElement('div')
    protected list = document.createElement('ul')
    protected status = document.createElement('div')
    protected statusTimer: NodeJS.Timeout | null = null
    protected map = new Map<string, ListItemElement>()

    constructor(name: string) {
        this.name = name
    }

    public create() {
        let fragment = document.createDocumentFragment()

        this.collapse.className = 'collapse border-bottom'
        this.collapse.id = randomId('collapse')
        this.collapse.appendChild(this.list)
        this.list.className = 'sidebar-toggle-list'

        this.button.className = 'sidebar-btn-toggle collapsed'
        this.button.setAttribute('data-bs-toggle', 'collapse')
        this.button.setAttribute('data-bs-target', '#' + this.collapse.id)
        this.button.setAttribute('aria-expanded', 'false')
        this.button.innerHTML = `
            <svg width="0.75rem" height="0.75rem" fill="currentColor" class="bi bi-chevron-right sidebar-btn-chevron mx-2" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>${this.name}`
        this.button.appendChild(this.status)
        this.status.className = 'sidebar-btn-status'
        this.button.addEventListener('click', () => {
            if (this.onSelect) this.onSelect(this.name)
        })

        this.initListeners()
        this.tryConnect()

        fragment.appendChild(this.button)
        fragment.appendChild(this.collapse)

        return fragment
    }

    public tryConnect() {
        ipcRenderer.send('core-get-tasks:' + this.name)
        let status = false
        this.statusTimer = setInterval(() => {
            if (status) this.status.innerHTML = `
                <svg width="0.75rem" height="0.75rem" fill="currentColor" class="bi bi-wifi-2" viewBox="0 0 16 16">
                    <path d="M13.229 8.271c.216-.216.194-.578-.063-.745A9.456 9.456 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.577 1.336c.205.132.48.108.652-.065zm-2.183 2.183c.226-.226.185-.605-.1-.75A6.473 6.473 0 0 0 8 9c-1.06 0-2.062.254-2.946.704-.285.145-.326.524-.1.75l.015.015c.16.16.408.19.611.09A5.478 5.478 0 0 1 8 10c.868 0 1.69.201 2.42.56.203.1.45.07.611-.091l.015-.015zM9.06 12.44c.196-.196.198-.52-.04-.66A1.99 1.99 0 0 0 8 11.5a1.99 1.99 0 0 0-1.02.28c-.238.14-.236.464-.04.66l.706.706a.5.5 0 0 0 .708 0l.707-.707z"/> 
                </svg>`
            else this.status.innerHTML = `
                <svg width="0.75rem" height="0.75rem" fill="currentColor" class="bi bi-wifi-1" viewBox="0 0 16 16">
                    <path d="M11.046 10.454c.226-.226.185-.605-.1-.75A6.473 6.473 0 0 0 8 9c-1.06 0-2.062.254-2.946.704-.285.145-.326.524-.1.75l.015.015c.16.16.407.19.611.09A5.478 5.478 0 0 1 8 10c.868 0 1.69.201 2.42.56.203.1.45.07.611-.091l.015-.015zM9.06 12.44c.196-.196.198-.52-.04-.66A1.99 1.99 0 0 0 8 11.5a1.99 1.99 0 0 0-1.02.28c-.238.14-.236.464-.04.66l.706.706a.5.5 0 0 0 .707 0l.708-.707z"/>
                </svg>`
            status = !status
        }, 500)
    }

    public remove() {
        this.map.forEach(value => value.remove())
        this.map.clear()
        this.button.remove()
        this.collapse.remove()
        ipcRenderer.removeAllListeners('ui-get-tasks-reply:' + this.name)
    }

    public filter(t: string) {
        this.map.forEach(value => value.filter(t))
        ipcRenderer.invoke('core-search-task:' + this.name, t).then(r => Array.from(JSON.parse(r)).forEach(t2 => {
            this.map.forEach(value => value.filter(String(t2).trim(), true))
        }))
    }

    public removeFilter() {
        this.map.forEach(value => value.removeFilter())
    }

    protected initListeners() {
        ipcRenderer.on('ui-get-tasks-reply:' + this.name, ((event, args, flag) => {
            if (args instanceof Map) {
                this.buildTree(args)
                if (this.statusTimer) clearInterval(this.statusTimer)
                if (!flag) {
                    new InfoToast(readLocal('ui.sidebar.native.load', this.name!)).show()
                    this.status.innerHTML = `
                        <svg width="0.75rem" height="0.75rem" fill="currentColor" class="bi bi-wifi-off" viewBox="0 0 16 16">
                            <path d="M10.706 3.294A12.545 12.545 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c.63 0 1.249.05 1.852.148l.854-.854zM8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065 8.448 8.448 0 0 1 3.51-1.27L8 6zm2.596 1.404.785-.785c.63.24 1.227.545 1.785.907a.482.482 0 0 1 .063.745.525.525 0 0 1-.652.065 8.462 8.462 0 0 0-1.98-.932zM8 10l.933-.933a6.455 6.455 0 0 1 2.013.637c.285.145.326.524.1.75l-.015.015a.532.532 0 0 1-.611.09A5.478 5.478 0 0 0 8 10zm4.905-4.905.747-.747c.59.3 1.153.645 1.685 1.03a.485.485 0 0 1 .047.737.518.518 0 0 1-.668.05 11.493 11.493 0 0 0-1.811-1.07zM9.02 11.78c.238.14.236.464.04.66l-.707.706a.5.5 0 0 1-.707 0l-.707-.707c-.195-.195-.197-.518.04-.66A1.99 1.99 0 0 1 8 11.5c.374 0 .723.102 1.021.28zm4.355-9.905a.53.53 0 0 1 .75.75l-10.75 10.75a.53.53 0 0 1-.75-.75l10.75-10.75z"/>
                        </svg>`
                } else {
                    new InfoToast(readLocal('ui.sidebar.remote.load', this.name!)).show()
                    this.status.innerHTML = `
                        <svg width="0.75rem" height="0.75rem" fill="currentColor" class="bi bi-wifi" viewBox="0 0 16 16">' +
                            <path d="M15.384 6.115a.485.485 0 0 0-.047-.736A12.444 12.444 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c2.507 0 4.827.802 6.716 2.164.205.148.49.13.668-.049z"/>' +
                            <path d="M13.229 8.271a.482.482 0 0 0-.063-.745A9.455 9.455 0 0 0 8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065A8.46 8.46 0 0 1 8 7a8.46 8.46 0 0 1 4.576 1.336c.206.132.48.108.653-.065zm-2.183 2.183c.226-.226.185-.605-.1-.75A6.473 6.473 0 0 0 8 9c-1.06 0-2.062.254-2.946.704-.285.145-.326.524-.1.75l.015.015c.16.16.407.19.611.09A5.478 5.478 0 0 1 8 10c.868 0 1.69.201 2.42.56.203.1.45.07.61-.091l.016-.015zM9.06 12.44c.196-.196.198-.52-.04-.66A1.99 1.99 0 0 0 8 11.5a1.99 1.99 0 0 0-1.02.28c-.238.14-.236.464-.04.66l.706.706a.5.5 0 0 0 .707 0l.707-.707z"/>' +
                        </svg>`
                }
            }
        }))
    }

    protected buildTree(map: Map<string, Array<string>>) {
        while (this.list.hasChildNodes()) this.list.lastChild?.remove()
        this.map.forEach(value => value.remove())
        this.map.clear()
        map.forEach((value, key) => {
            let element = new ListItemElement(key)
            this.list.appendChild(element.create(value))
            this.map.set(key, element)
            element.onSelect = (task: string) => {
                if (this.onSelect) this.onSelect(this.name)
                ipcRenderer.invoke('core-call-self-event', 'ui-select-task', this.name, task).then()
            }
        })
    }
}

export {ListItemGroup}