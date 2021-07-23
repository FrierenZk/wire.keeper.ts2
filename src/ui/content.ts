import {readLocal} from "../common/resources";
import {randomId} from "./random";

export class Content {
    static createFragment() {
        let fragment = document.createDocumentFragment()

        let tabSet = new TabSet()
        fragment.appendChild(tabSet.create())

        return fragment
    }
}

class TabSet {
    protected map = new Map<string, TabItem>()

    public create() {
        let fragment = document.createDocumentFragment()

        let tabSet = document.createElement('div')
        tabSet.className = 'content-tab-set'
        fragment.appendChild(tabSet)

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

        addBtn.addEventListener('click', () => {
            while (dropdown.hasChildNodes()) dropdown.lastChild?.remove()
            let fragment = document.createDocumentFragment()
            ;['task', 'timer'].forEach(value => {
                let li = document.createElement('li')
                li.textContent = value
                li.className = 'dropdown-item'
                li.onclick = () => {
                    console.log(`dropdown click ${value}`)
                    //TODO append tab to tab set
                }
                fragment.appendChild(li)
            })
            dropdown.appendChild(fragment)
        })

        return fragment
    }

}

class TabItem {
    public onClick: (() => void) | null = null
    protected tab = document.createElement('div')

    public create(title: string) {
        this.tab.className = 'content-tab-item'
        this.tab.setAttribute('custom-active', 'false')
        this.tab.onclick = () => {
            this.tab.setAttribute('custom-active', 'true')
            if (this.onClick) this.onClick()
        }
        this.tab.textContent = title
        return this.tab
    }

    public deactivate() {
        this.tab.setAttribute('custom-active', 'false')
    }
}