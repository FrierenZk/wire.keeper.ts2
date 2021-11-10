import {TabItem} from "./TabItem";
import {Page} from "./page/Page";
import {PageBuilder} from "./PageBuilder";
import {readLocal} from "../../common/resources";
import {TaskPage} from "./page/TaskPage";
import {ConfigPage} from "./page/ConfigPage";
import {randomId} from "../random";

class TabSet {
    protected tabDiv = document.createElement('div')
    protected pageContainer = document.createElement('div')
    protected map = new Map<string, TabItem>()
    protected currentPage: Page | null = null
    protected pageList: Array<PageBuilder> = [{
        label: `${readLocal('ui.content.label.task')}`,
        newPage: () => new TaskPage(),
        hide: true
    }, {
        label: `${readLocal('ui.content.label.configuration')}`,
        newPage: () => new ConfigPage(),
        hide: false
    }]

    public create() {
        let fragment = document.createDocumentFragment()

        let tabSet = document.createElement('div')
        tabSet.className = 'content-tab-set row-12'
        fragment.appendChild(tabSet)

        tabSet.appendChild(this.tabDiv)
        this.tabDiv.className = 'p-0 m-0 d-inline-flex flex-row align-items-center'
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
        tabSet.appendChild(dropdown)
        dropdown.className = 'dropdown-menu'
        dropdown.style.fontSize = '0.75rem'
        dropdown.setAttribute('aria-labelledby', addBtn.id)
        dropdown.innerHTML = '<li class="dropdown-item">example</li>'

        fragment.appendChild(this.pageContainer)
        this.pageContainer.className = 'content-page row-12'

        addBtn.addEventListener('click', () => {
            while (dropdown.hasChildNodes()) dropdown.lastChild?.remove()
            let fragment = document.createDocumentFragment()
            this.pageList.forEach(value => {
                if (value.hide) return
                if (this.map.has(value.label)) return
                let li = document.createElement('li')
                li.textContent = value.label
                li.className = 'dropdown-item user-select-none'
                li.onclick = () => {
                    this.appendTabItem(value)
                }
                fragment.appendChild(li)
            })
            dropdown.appendChild(fragment)
        })

        return fragment
    }

    public openTaskTab(arr: Array<string>) {
        let label = readLocal('ui.content.label.task')
        if (this.map.has(label)) {
            this.map.get(label)?.page?.preSet(arr)
            this.map.get(label)?.active()
        } else {
            let value = this.pageList.find(value => value?.label === label)
            if (value) this.appendTabItem(value, true, arr)
        }
    }

    public openConfigurationTab(args: any) {
        let label = readLocal('ui.content.label.configuration')
        if (this.map.has(label)) {
            let item = this.map.get(label)
            if (item?.remove) item.remove()
            this.map.delete(label)
        }
        let value = this.pageList.find(value => value?.label === label)
        if (value) this.appendTabItem(value, true, args)
    }

    protected appendTabItem(builder: PageBuilder, select: boolean = false, para: any = null) {
        let item = new TabItem()
        let label = builder.label!
        let page = builder.newPage!()!
        if (para) page.preSet(para)
        this.tabDiv.appendChild(item.create(label))
        this.map.set(label, item)
        item.page = page
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

export {TabSet}