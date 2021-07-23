import {readLocal} from "../common/resources";
import {ipcRenderer} from "electron";
import {randomId} from "./random";
import {showAddModal, showAlert, showConfirmModal, showToast} from "../index-renderer";

export class Sidebar {
    static createFragment() {
        let fragment = document.createDocumentFragment()

        let buttons = new Buttons()
        let searchLabel = new SearchLabel()
        let connectionList = new ConnectionList()

        let header = document.createElement('h6')
        header.className = 'sidebar-heading border-bottom'
        header.textContent = 'Main'
        fragment.appendChild(header)

        buttons.refresh = () => {
            connectionList.refresh()
        }
        buttons.delete = () => {
            connectionList.delete()
        }
        fragment.appendChild(buttons.create())

        searchLabel.filter = (value) => {
            connectionList.filter(value)
        }
        searchLabel.removeFilter = () => {
            connectionList.removeFilter()
        }
        fragment.appendChild(searchLabel.create())

        fragment.appendChild(connectionList.create())

        let version = document.createElement('div')
        fragment.appendChild(version)
        version.className = 'sidebar-version'
        ipcRenderer.invoke('core-get-version').then(value => {
            version.innerHTML = `<p>ver ${value}</p>`
        })

        return fragment
    }
}

class Buttons {
    public refresh: (() => void) | null = null
    public delete: (() => void) | null = null

    public create() {
        let fragment = document.createDocumentFragment()

        let buttons = document.createElement('div')
        buttons.className = 'sidebar-btn-group border-bottom'
        fragment.appendChild(buttons)

        let refreshBtn = document.createElement('button')
        refreshBtn.title = readLocal('ui.sidebar.refresh')
        refreshBtn.innerHTML = `
            <svg width="16" height="16" fill="currentColor" class="bi bi-bootstrap-reboot" viewBox="0 0 16 16">
                <path d="M1.161 8a6.84 6.84 0 1 0 6.842-6.84.58.58 0 1 1 0-1.16 8 8 0 1 1-6.556 3.412l-.663-.577a.58.58 0 0 1 .227-.997l2.52-.69a.58.58 0 0 1 .728.633l-.332 2.592a.58.58 0 0 1-.956.364l-.643-.56A6.812 6.812 0 0 0 1.16 8z"/>
                <path d="M6.641 11.671V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352h1.141zm0-3.75V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324h-1.6z"/>
            </svg>`
        refreshBtn.onclick = () => {
            if (this.refresh) this.refresh()
        }
        ipcRenderer.on('ui-navi-refresh-button', () => refreshBtn.click())
        buttons.appendChild(refreshBtn)

        let splitter = document.createElement('div')
        splitter.className = 'splitter'
        buttons.appendChild(splitter)

        let addBtn = document.createElement('button')
        addBtn.title = readLocal('ui.sidebar.add')
        addBtn.innerHTML = `
            <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>`
        addBtn.onclick = () => {
            showAddModal()
        }
        ipcRenderer.on('ui-navi-add-button', () => addBtn.click())
        buttons.appendChild(addBtn)

        let xBtn = document.createElement('button')
        xBtn.title = readLocal('ui.sidebar.delete')
        xBtn.innerHTML = `
            <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`
        xBtn.onclick = () => {
            if (this.delete) this.delete()
        }
        ipcRenderer.on('ui-navi-x-button', () => xBtn.click())
        buttons.appendChild(xBtn)

        ;[refreshBtn, addBtn, xBtn].forEach(value => {
            value.className = 'sidebar-btn'
            value.setAttribute('data-bs-toggle', 'tooltip')
            value.setAttribute('data-bs-placement', 'top')
        })

        return fragment
    }
}

class SearchLabel {
    public filter: ((_: string) => void) | null = null
    public removeFilter: (() => void) | null = null

    public create() {
        let fragment = document.createDocumentFragment()

        let search = document.createElement('div')
        search.className = 'd-flex flex-column border-bottom'
        fragment.appendChild(search)

        let searchLabel = document.createElement('div')
        search.appendChild(searchLabel)
        searchLabel.className = 'd-flex flex-row sidebar-search-label'
        searchLabel.innerHTML = `
            <svg width="1.25rem" height="1.25rem" fill="currentColor" class="bi bi-search me-2" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>`

        let searchInput = document.createElement('input')
        searchInput.className = 'form-control form-control-sm sidebar-search-input'
        searchInput.placeholder = readLocal('ui.sidebar.type.to.search')
        searchLabel.appendChild(searchInput)

        let searchBtn = document.createElement('button')
        searchBtn.className = 'sidebar-btn sidebar-search-btn'
        searchBtn.innerHTML = `
            <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>`
        searchLabel.appendChild(searchBtn)

        let filters = document.createElement('div')
        search.appendChild(filters)

        searchBtn.onclick = () => {
            if (searchInput.value.trim().length > 0) {
                while (filters.hasChildNodes()) filters.lastChild?.remove()
                let alert = document.createElement('div')
                alert.className = 'sidebar-search-filter'
                alert.innerHTML = `${readLocal('ui.sidebar.filter.html', searchInput.value.trim())}`
                let btn = document.createElement('button')
                alert.appendChild(btn)
                btn.type = 'button'
                btn.className = 'btn-close'
                btn.style.width = '0.25rem'
                btn.style.height = '0.25rem'
                btn.style.marginLeft = '0.5rem'
                btn.setAttribute('data-bs-dismiss', 'alert')
                btn.setAttribute('aria-label', 'Close')
                btn.onclick = () => {
                    if (this.removeFilter) this.removeFilter()
                    setImmediate(() => alert.remove())
                }
                filters.appendChild(alert)
                if (this.filter) this.filter(searchInput.value.trim())
            }
        }

        return fragment
    }
}

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
            showConfirmModal(readLocal('ui.navi.delete.title', this.select.trim()), () => {
                ipcRenderer.send('core-delete-connection', this.select.trim())
            })
        else showAlert(readLocal('ui.navi.delete.alert'))
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
                    showToast(readLocal('ui.navi.native.load', this.name!))
                    this.status.innerHTML = `
                        <svg width="0.75rem" height="0.75rem" fill="currentColor" class="bi bi-wifi-off" viewBox="0 0 16 16">
                            <path d="M10.706 3.294A12.545 12.545 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c.63 0 1.249.05 1.852.148l.854-.854zM8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065 8.448 8.448 0 0 1 3.51-1.27L8 6zm2.596 1.404.785-.785c.63.24 1.227.545 1.785.907a.482.482 0 0 1 .063.745.525.525 0 0 1-.652.065 8.462 8.462 0 0 0-1.98-.932zM8 10l.933-.933a6.455 6.455 0 0 1 2.013.637c.285.145.326.524.1.75l-.015.015a.532.532 0 0 1-.611.09A5.478 5.478 0 0 0 8 10zm4.905-4.905.747-.747c.59.3 1.153.645 1.685 1.03a.485.485 0 0 1 .047.737.518.518 0 0 1-.668.05 11.493 11.493 0 0 0-1.811-1.07zM9.02 11.78c.238.14.236.464.04.66l-.707.706a.5.5 0 0 1-.707 0l-.707-.707c-.195-.195-.197-.518.04-.66A1.99 1.99 0 0 1 8 11.5c.374 0 .723.102 1.021.28zm4.355-9.905a.53.53 0 0 1 .75.75l-10.75 10.75a.53.53 0 0 1-.75-.75l10.75-10.75z"/>
                        </svg>`
                } else {
                    showToast(readLocal('ui.navi.remote.load', this.name!))
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
            element.onSelect = () => {
                if (this.onSelect) this.onSelect(this.name)
                ipcRenderer.send('core-call-self-event', 'ui-select-task', this.name, key)
            }
        })
    }
}

class ListItemElement {
    public onSelect: (() => void) | null = null
    protected name: string
    protected button = document.createElement('div')
    protected collapse = document.createElement('div')
    protected map = new Map<string, HTMLElement>()

    constructor(name: string) {
        this.name = name
    }

    public create(arr: Array<string>) {
        let fragment = document.createDocumentFragment()

        this.collapse.className = 'collapse'
        this.collapse.id = randomId('collapse')
        let list = document.createElement('ul')
        this.collapse.appendChild(list)

        this.button.className = 'sidebar-toggle-list-btn collapsed'
        this.button.setAttribute('data-bs-toggle', 'collapse')
        this.button.setAttribute('data-bs-target', '#' + this.collapse.id)
        this.button.setAttribute('aria-expanded', 'false')
        this.button.innerHTML = `
            <svg width="0.75rem" height="0.75rem" fill="currentColor" class="bi bi-chevron-right sidebar-btn-chevron mx-2" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>${this.name}`
        this.button.addEventListener('click', () => {
            if (this.onSelect) this.onSelect()
        })

        arr.forEach(value => {
            let divElement = document.createElement('div')
            divElement.className = 'sidebar-toggle-list-element'
            divElement.setAttribute('title', value)
            divElement.onclick = () => {
                if (this.onSelect) this.onSelect()
            }
            this.map.set(value, divElement)
            divElement.textContent = value
            list.appendChild(divElement)
        })

        fragment.appendChild(this.button)
        fragment.appendChild(this.collapse)

        return fragment
    }

    public remove() {
        this.map.forEach(value => value.remove())
        this.map.clear()
        this.button.remove()
        this.collapse.remove()
    }

    public filter(t: string) {
        this.removeFilter()
        let f = true
        this.map.forEach((value, key) => {
            if (!key.includes(t)) value.hidden = true
            else f = false
        })
        if (f) {
            this.button.hidden = true
            this.collapse.hidden = true
        }
    }

    public removeFilter() {
        this.button.removeAttribute('hidden')
        this.collapse.removeAttribute('hidden')
        this.map.forEach(value => value.removeAttribute('hidden'))
    }
}
