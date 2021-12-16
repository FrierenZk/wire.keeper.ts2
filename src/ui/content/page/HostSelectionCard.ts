import {randomId} from "../../random";
import {ipcRenderer} from "electron";
import {ObserverField} from "../../databingding/ObserverField";

class HostSelectionCard {
    protected selectListener: ((_: string) => Promise<void>) | null = null
    protected hostObserver = ObserverField.fromString('')

    create(host: string | null) {
        if (Number(host?.trim()?.length) > 0) this.hostObserver.set(host!)
        else ipcRenderer.invoke('core-get-connections').then(r => {
            let first = Array.from(r)[0]
            if (first) {
                this.hostObserver.set(String(first))
                if (this.selectListener) this.selectListener(String(first)).then()
            }
        })

        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'content-page-card flex-row'

        let body = document.createElement('div')
        card.appendChild(body)
        body.className = 'card-body'

        let btnGroup = document.createElement('div')
        body.appendChild(btnGroup)
        btnGroup.className = 'btn-group col'

        let hostBtn = document.createElement('button')
        btnGroup.appendChild(hostBtn)
        hostBtn.type = 'button'
        hostBtn.className = 'btn btn-primary text-wrap w-100'
        this.hostObserver.setBinding(hostBtn)

        let dropdownBtn = document.createElement('button')
        btnGroup.appendChild(dropdownBtn)
        dropdownBtn.type = 'button'
        dropdownBtn.className = 'btn btn-primary dropdown-toggle dropdown-toggle-split'
        dropdownBtn.id = randomId('dropdown')
        dropdownBtn.setAttribute('data-bs-toggle', 'dropdown')
        dropdownBtn.setAttribute('aria-expanded', 'false')

        let dropdownMenu = document.createElement('ul')
        btnGroup.appendChild(dropdownMenu)
        dropdownMenu.className = 'dropdown-menu'
        dropdownMenu.setAttribute('aria-labelledby', dropdownBtn.id)

        dropdownBtn.addEventListener('click', async (ev) => {
            let arr = Array.from(await ipcRenderer.invoke('core-get-connections'))
            while (dropdownMenu.hasChildNodes()) dropdownMenu.removeChild(dropdownMenu.lastChild!)
            arr.forEach(value => {
                let li = document.createElement('li')
                li.className = 'dropdown-item text-wrap user-select-none'
                li.textContent = String(value)
                li.addEventListener('click', async (ev) => {
                    if (this.selectListener) this.selectListener(String(value)).then()
                    this.hostObserver.set(String(value))
                    ev.cancelBubble
                })
                dropdownMenu.appendChild(li)
            })
            ev.cancelBubble
        })

        return fragment
    }

    bindListener(fn: (_: string) => Promise<void>) {
        this.selectListener = fn
    }
}

export {HostSelectionCard}