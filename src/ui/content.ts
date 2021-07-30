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
                    console.log(`dropdown click ${value}`)
                    this.appendTabItem(value)
                }
                fragment.appendChild(li)
            })
            dropdown.appendChild(fragment)
        })

        return fragment
    }

    protected appendTabItem(builder: PageBuilder) {
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

    public deactivate() {
        this.tab.setAttribute('custom-active', 'false')
    }
}

class PageBuilder {
    label: string | undefined
    newPage: (() => Page) | undefined
}

interface Page {
    create(): Promise<DocumentFragment>

    remove(): void
}

class TaskPage implements Page {
    protected cleanList: Array<HTMLElement> = []

    public async create() {
        let fragment = document.createDocumentFragment()
        
        ipcRenderer.on('ui-select-task', this.update)
        return fragment
    }

    public remove(): void {
        this.cleanList.forEach(value => value.remove())
        ipcRenderer.removeListener('ui-select-task', this.update)
    }

    protected update(event: IpcRendererEvent, args:any) {
        console.log(args)
    }
}