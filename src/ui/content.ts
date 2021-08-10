import {randomId} from "./random";
import {readLocal} from "../common/resources";
import {ipcRenderer, IpcRendererEvent} from "electron";

let selectHost = 'None';
let selectTask = 'None'

export class Content {
    static createFragment() {
        let fragment = document.createDocumentFragment()

        let tabSet = new TabSet()
        fragment.appendChild(tabSet.create())

        ipcRenderer.on('ui-select-task', (event, args) => {
            if (args instanceof Array) {
                selectHost = args[0]
                selectTask = args[1]
                if (selectHost && selectTask) tabSet.openTaskTab()
            }
        })

        return fragment
    }
}

class TabSet {
    protected tabDiv = document.createElement('div')
    protected pageContainer = document.createElement('div')
    protected map = new Map<string, TabItem>()
    protected currentPage: Page | null = null
    protected pageList: Array<PageBuilder> = [{
        label: `${readLocal('ui.content.label.task')}`,
        newPage: () => new TaskPage()
    },]

    public create() {
        let fragment = document.createDocumentFragment()

        let tabSet = document.createElement('div')
        tabSet.className = 'content-tab-set'
        fragment.appendChild(tabSet)

        tabSet.appendChild(this.tabDiv)
        this.tabDiv.className = 'p-0 m-0 d-inline-flex flex-row'
        this.tabDiv.style.minHeight = '2rem'

        let addBtn = document.createElement('div')
        addBtn.id = randomId('button')
        addBtn.className = 'content-tab-btn'
        addBtn.setAttribute('data-bs-toggle', 'dropdown')
        addBtn.setAttribute('aria-expanded', 'false')
        addBtn.innerHTML = `
            <svg width="1.5rem" height="1.5rem" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>`
        tabSet.appendChild(addBtn)

        let dropdown = document.createElement('ul')
        dropdown.className = 'dropdown-menu'
        dropdown.style.fontSize = '0.75rem'
        dropdown.setAttribute('aria-labelledby', addBtn.id)
        dropdown.innerHTML = '<li class="dropdown-item">example</li>'

        tabSet.appendChild(dropdown)

        fragment.appendChild(this.pageContainer)
        this.pageContainer.className = 'content-page'

        addBtn.addEventListener('click', () => {
            while (dropdown.hasChildNodes()) dropdown.lastChild?.remove()
            let fragment = document.createDocumentFragment()
            this.pageList.forEach(value => {
                if (this.map.has(value.label!)) return
                let li = document.createElement('li')
                li.textContent = value.label!
                li.className = 'dropdown-item'
                li.onclick = () => {
                    this.appendTabItem(value)
                }
                fragment.appendChild(li)
            })
            dropdown.appendChild(fragment)
        })

        return fragment
    }

    public openTaskTab() {
        let label = readLocal('ui.content.label.task')
        if (this.map.has(label)) {
            this.map.get(label)?.active()
        } else {
            let value = this.pageList.find(value => value?.label === label)
            if (value) this.appendTabItem(value, true)
        }
    }

    protected appendTabItem(builder: PageBuilder, select: boolean = false) {
        let item = new TabItem()
        let label = builder.label!
        let page = builder.newPage!()!
        this.tabDiv.appendChild(item.create(label))
        this.map.set(label, item)
        item.onClick = () => {
            this.map.forEach((value, key) => {
                if (key != label) value.deactivate()
            })
            this.updatePage(page)
        }
        item.onRemove = () => {
            if (this.currentPage === page) {
                this.currentPage.remove()
                this.currentPage = null
                while (this.pageContainer.hasChildNodes()) this.pageContainer.lastChild?.remove()
            }
            this.map.delete(label)
        }
        if (select) item.active()
    }

    protected updatePage(page: Page) {
        this.currentPage?.remove()
        while (this.pageContainer.hasChildNodes()) this.pageContainer.lastChild?.remove()

        this.currentPage = page
        page.create().then(r => {
            this.pageContainer.appendChild(r)
        })
    }
}

class TabItem {
    public onClick: (() => void) | null = null
    public onRemove: (() => void) | null = null
    protected tab = document.createElement('div')

    public create(title: string) {
        this.tab.className = 'content-tab-item'
        this.tab.setAttribute('custom-active', 'false')
        this.tab.onclick = () => {
            this.tab.setAttribute('custom-active', 'true')
            if (this.onClick) this.onClick()
        }
        this.tab.textContent = title
        let xBtn = document.createElement('div')
        this.tab.appendChild(xBtn)
        xBtn.className = 'content-tab-item-x'
        xBtn.innerHTML = `
            <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`
        xBtn.addEventListener('click', (e) => {
            e.cancelBubble = true
            this.tab.remove()
            if (this.onRemove) this.onRemove()
        })
        return this.tab
    }

    public active() {
        this.tab.click()
    }

    public deactivate() {
        this.tab.setAttribute('custom-active', 'false')
    }
}

abstract class PageBuilder {
    label: string | undefined
    newPage: (() => Page) | undefined
}

interface Page {
    create(): Promise<DocumentFragment>

    remove(): void
}

class TaskPage implements Page {
    protected cleanList: Array<HTMLElement> = []
    protected updateListeners: Array<(host: string, task: string) => void> = []
    protected rendererListeners: Map<string, Array<(event: IpcRendererEvent, args: any) => void>> = new Map()

    public async create() {
        let fragment = document.createDocumentFragment()

        fragment.appendChild(this.createHeader())
        fragment.appendChild(this.createBody())

        this.bindRendererListeners('ui-select-task', (event: IpcRendererEvent, args: any) => {
            try {
                let host = args[0]
                let task = args[1]
                this.updateListeners.forEach(value => value(host, task))
            } catch (e) {
                console.error(e)
            }
        })

        return fragment
    }

    public remove(): void {
        this.cleanList.forEach(value => value.remove())
        this.rendererListeners.forEach((value, key) => {
            value.forEach(func => {
                ipcRenderer.removeListener(key, func)
            })
        })
    }

    protected createHeader() {
        let fragment = document.createDocumentFragment()

        let content = document.createElement('div')
        fragment.appendChild(content)
        this.cleanList.push(content)
        content.className = 'd-flex flex-row'

        let div = document.createElement('div')
        content.appendChild(div)
        div.className = 'd-flex flex-column w-30'
        div.style.minWidth = '20rem'
        div.appendChild(this.createLabel())
        div.appendChild(this.createButtons())

        content.appendChild(this.createSpec())

        return fragment
    }

    protected createLabel() {
        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'content-page-card flex-column'

        let title = document.createElement('div')
        card.appendChild(title)
        title.className = 'content-page-task-card-item'

        let titleHeader = document.createElement('div')
        title.appendChild(titleHeader)
        titleHeader.className = 'header'
        titleHeader.textContent = readLocal('ui.content.page.task.title')

        let titleContent = document.createElement('div')
        title.appendChild(titleContent)
        titleContent.className = 'body'
        let update = ((host: string, task: string) => titleContent.textContent = `${host} / ${task}`)
        update(selectHost, selectTask)
        this.updateListeners.push(update)

        return fragment
    }

    protected createButtons() {
        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'content-page-card flex-column'

        let header = document.createElement('div')
        card.appendChild(header)
        header.className = 'content-page-task-status-header'
        header.textContent = readLocal('ui.content.page.task.status')

        let body = document.createElement('div')
        card.appendChild(body)
        body.className = 'content-page-task-status-body'

        let dot = document.createElement('div')
        body.appendChild(dot)
        dot.className = 'dot'
        dot.setAttribute('toggle-color', 'default')

        let p = document.createElement('p')
        body.appendChild(p)
        p.textContent = 'None'
        let update = (event: IpcRendererEvent, status: string) => {
            p.textContent = status
        }
        let pre = selectHost
        ipcRenderer.on('ui-get-task-status-reply:' + pre, update)
        this.updateListeners.push(((host, _) => {
            ipcRenderer.removeListener('ui-get-task-status-reply:' + pre, update)
            ipcRenderer.on('ui-get-task-status-reply:' + host, update)
            pre = host
            p.textContent = 'None'
            ipcRenderer.send('core-get-task-status:' + selectHost, selectTask)
        }))
        p.addEventListener('click', ev => {
            ipcRenderer.send('core-get-task-status:' + selectHost, selectTask)
            ev.cancelBubble
        })
        p.click()

        let buttons = document.createElement('div')
        body.appendChild(buttons)
        buttons.className = 'content-page-task-status-buttons'
        buttons.addEventListener('click', (ev => ev.cancelBubble))

        let play = document.createElement('div')
        buttons.appendChild(play)
        play.className = 'play-btn'
        play.innerHTML = `
            <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>`
        play.addEventListener('click', ev => {
            ipcRenderer.invoke('core-start-task:' + selectHost, selectTask).then(() => p.click())
            ev.cancelBubble
        })

        let stop = document.createElement('div')
        buttons.appendChild(stop)
        stop.className = 'stop-btn'
        stop.innerHTML = `
            <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-stop-fill" viewBox="0 0 16 16">
                <path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5z"/>
            </svg>`
        stop.addEventListener('click', ev => {
            ipcRenderer.invoke('core-stop-task:' + selectHost, selectTask).then(() => p.click())
            ev.cancelBubble
        })

        return fragment
    }

    protected createSpec() {
        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'content-page-card flex-column'

        return fragment
    }

    protected createBody() {
        return document.createDocumentFragment()
    }

    protected bindRendererListeners(channel: string, func: (event: IpcRendererEvent, args: any) => void) {
        if (!this.rendererListeners.has(channel)) this.rendererListeners.set(channel, [])
        this.rendererListeners.get(channel)!.push(func)
        ipcRenderer.on(channel, func)
    }
}