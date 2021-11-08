import {randomId} from "../random";

class ListItemElement {
    public onSelect: ((_: string) => void) | null = null
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

        arr.forEach(value => {
            let divElement = document.createElement('div')
            divElement.className = 'sidebar-toggle-list-element'
            divElement.setAttribute('title', value)
            divElement.onclick = () => {
                if (this.onSelect) this.onSelect(value)
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

    public filter(t: string, addition: boolean = false) {
        if (!addition) this.removeFilter()
        let f = true
        this.map.forEach((value, key) => {
            if (!key.includes(t)) {
                if (!addition) value.hidden = true
            } else {
                if (addition) value.removeAttribute('hidden')
                f = false
            }
        })
        if (f && !addition) {
            this.button.hidden = true
            this.collapse.hidden = true
        }
        if (addition && !f) {
            this.button.removeAttribute('hidden')
            this.collapse.removeAttribute('hidden')
        }
    }

    public removeFilter() {
        this.button.removeAttribute('hidden')
        this.collapse.removeAttribute('hidden')
        this.map.forEach(value => value.removeAttribute('hidden'))
    }
}

export {ListItemElement}