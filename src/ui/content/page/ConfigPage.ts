import {APage} from "./APage";
import {ObserverInputField} from "../../databingding/ObserverInputField";
import {parseMap} from "../../../common/parser";
import {readLocal} from "../../../common/resources";
import {ipcRenderer} from "electron";
import {ConfirmModal} from "../../modal/ConfirmModal";
import {HeaderCard} from "./HeaderCard";
import {EditableInputItem} from "./EditableInputItem";
import {HostSelectionCard} from "./HostSelectionCard";
import {MassiveInputCard} from "./MassiveInputCard";

class ConfigPage extends APage {
    protected mode: string = ''
    protected host: string = ''
    protected nameObserver = ObserverInputField.fromString('')
    protected categoryObserver = ObserverInputField.fromString('')
    protected profileObserver = ObserverInputField.fromString('')
    protected svnObserver = ObserverInputField.fromString('')
    protected otherObservers: Map<string, ObserverInputField<any>> = new Map()
    protected otherKeys = new Set<string>()

    preSet(args: any): void {
        try {
            this.mode = args[0]?.mode
            let host = args[0]?.host
            if (host) this.host = String(host)
            let config = args[0]?.config
            if (config) {
                if (config.name) this.nameObserver = ObserverInputField.fromString(config.name)
                if (config.category) this.categoryObserver = ObserverInputField.fromString(config.category)
                if (config.profile) this.profileObserver = ObserverInputField.fromString(config.profile)
                if (config.extraParas) {
                    if (config.extraParas.svn) this.svnObserver = ObserverInputField.fromString(config.extraParas.svn)
                    parseMap(JSON.stringify(config.extraParas)).forEach((((value, key) => {
                        if (key != 'svn') {
                            this.otherKeys.add(key)
                            this.otherObservers.set(key, ObserverInputField.fromString(value))
                        }
                    })))
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    public async create() {
        let fragment = document.createDocumentFragment()

        fragment.appendChild(this.createHeader())
        fragment.appendChild(this.createContent())

        return fragment
    }

    protected createHeader() {
        let title: string
        let button = document.createElement('button')
        button.type = 'button'
        button.className = 'btn btn-sm btn-primary mx-2'

        switch (this.mode) {
            case 'run':
                title = readLocal('ui.content.page.config.title.run')
                button.textContent = readLocal('ui.content.page.config.btn.run')
                button.addEventListener('click', (ev) => {
                    ipcRenderer.invoke('core-start-custom-task:' + this.host, this.package()).then()
                    ev.cancelBubble
                })
                break
            case 'edit':
                title = readLocal('ui.content.page.config.title.edit')
                button.textContent = readLocal('ui.content.page.config.btn.save')
                button.addEventListener('click', async (ev) => {
                    new ConfirmModal(readLocal('ui.content.page.config.confirm.edit', this.nameObserver.get()), () => {
                        ipcRenderer.invoke('core-modify-config:' + this.host, this.package()).then()
                    }).show()
                    ev.cancelBubble
                })
                break
            default:
                title = readLocal('ui.content.page.config.title.create')
                button.textContent = readLocal('ui.content.page.config.btn.save')
                button.addEventListener('click', async (ev) => {
                    new ConfirmModal(readLocal('ui.content.page.config.confirm.create', this.nameObserver.get()), () => {
                        ipcRenderer.invoke('core-create-config:' + this.host, this.package()).then()
                    }).show()
                    ev.cancelBubble
                })
                break
        }

        return new HeaderCard().create(title, button)
    }

    protected createContent() {
        let fragment = document.createDocumentFragment()

        let div = document.createElement('div')
        fragment.appendChild(div)
        div.className = 'd-flex flex-row'
        this.cleanList.push(div)

        let left = document.createElement('div')
        div.appendChild(left)
        left.className = 'd-flex flex-column'

        let hostCard = new HostSelectionCard()
        hostCard.bindListener(async (host) => {
            this.host = host
        })
        left.appendChild(hostCard.create(this.host))
        left.appendChild(this.createBasic())

        let right = document.createElement('div')
        div.appendChild(right)
        right.className = 'd-flex flex-column col'
        right.appendChild(new MassiveInputCard().create(readLocal('ui.content.page.config.extra.title'), this.otherObservers))

        return fragment
    }

    protected createBasic() {
        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'content-page-card'

        let body = document.createElement('div')
        card.appendChild(body)
        body.className = 'card-body flex-column'
        body.innerHTML = `<h5 class="font-monospace border-bottom ps-2 py-1 fw-bold user-select-none">${readLocal('ui.content.page.config.basic.title')}</h5>`

        ;[
            {label: "name", field: this.nameObserver},
            {label: "category", field: this.categoryObserver},
            {label: "profile", field: this.profileObserver},
            {label: "svn", field: this.svnObserver}
        ].forEach(value => {
            let div = document.createElement('div')
            body.appendChild(div)
            div.className = 'my-1'
            div.appendChild(new EditableInputItem().create(value.label, value.field))
        })

        return fragment
    }

    protected package() {
        let extra = new Map<string, any>()
        extra.set('svn', this.svnObserver.get())
        this.otherObservers.forEach((value, key) => {
            extra.set(key, value.get())
        })
        this.otherKeys.forEach(value => {
            if (!extra.has(value)) extra.set(value, '')
        })
        return {
            name: this.nameObserver.get(),
            category: this.categoryObserver.get(),
            profile: this.profileObserver.get(),
            extraParas: Object.fromEntries(extra)
        }
    }
}

export {ConfigPage}