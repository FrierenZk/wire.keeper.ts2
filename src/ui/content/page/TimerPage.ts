import {APage} from "./APage";
import {readLocal} from "../../../common/resources";
import {HeaderCard} from "./HeaderCard";
import {HostSelectionCard} from "./HostSelectionCard";
import {ObserverInputField} from "../../databingding/ObserverInputField";
import {EditableInputItem} from "./EditableInputItem";
import {MassiveInputCard} from "./MassiveInputCard";
import {parseMap} from "../../../common/parser";
import {ipcRenderer} from "electron";
import {ConfirmModal} from "../../modal/ConfirmModal";

class TimerPage extends APage {
    protected mode: string = ''
    protected host: string = ''
    protected nameObserver = ObserverInputField.fromString('')
    protected refObserver = ObserverInputField.fromString('')
    protected delayObserver = ObserverInputField.fromNumber(60)
    protected profileObserver = ObserverInputField.fromString('')
    protected extras = new Map<string, ObserverInputField<any>>()
    protected extrasKeys = new Set<string>()

    preSet(args: any): void {
        try {
            this.mode = args[0]?.mode
            let host = args[0]?.host
            if (host) this.host = String(host)
            let config = args[0]?.config
            if (config) {
                if (config.name) this.nameObserver.set(String(config.name))
                if (config.ref) this.refObserver.set(String(config.ref))
                if (config.delay) this.delayObserver.set(Number(config.delay))
                let conf = config.config
                if (conf) {
                    if (conf.profile) this.profileObserver.set(String(conf.profile))
                    if (conf.extraParas) parseMap(JSON.stringify(conf.extraParas)).forEach((value, key) => {
                        this.extrasKeys.add(key)
                        switch (typeof value) {
                            case "boolean":
                                this.extras.set(key, ObserverInputField.from<boolean>(Boolean(value),
                                    value => String(value), str => str === 'true'))
                                break
                            case "number":
                                this.extras.set(key, ObserverInputField.fromNumber(value))
                                break
                            case "string":
                                this.extras.set(key, ObserverInputField.fromString(value))
                                break
                            default:
                                console.warn(`Invalid parameter received, ${key}, ${value}`)
                        }
                    })
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    async create() {
        if (!this.extras.has('buildOnlyIfUpdated')) this.extras.set('buildOnlyIfUpdated',
            ObserverInputField.from<boolean>(true, value => String(value), str => str === 'true'))

        let fragment = document.createDocumentFragment()

        fragment.appendChild(this.createHeader())
        fragment.appendChild(this.createBody())

        return fragment
    }

    protected createHeader() {
        let title: string
        let button = document.createElement('button')
        button.type = 'button'
        button.className = 'btn btn-sm btn-primary mx-2'
        button.textContent = readLocal('ui.content.page.timer.save')
        switch (this.mode) {
            case 'edit':
                title = readLocal('ui.content.page.timer.title.edit')
                button.addEventListener('click', async (ev) => {
                    ev.cancelBubble
                    new ConfirmModal(readLocal('ui.content.page.timer.confirm.edit', this.nameObserver.get()), () => {
                        ipcRenderer.invoke('core-modify-timer:' + this.host, this.package()).then()
                    }).show()
                })
                break
            default:
                title = readLocal('ui.content.page.timer.title.create')
                button.addEventListener('click', async (ev) => {
                    ev.cancelBubble
                    new ConfirmModal(readLocal('ui.content.page.timer.confirm.create', this.nameObserver.get()), () => {
                        ipcRenderer.invoke('core-add-timer:' + this.host, this.package()).then()
                    }).show()
                })
                break
        }
        return new HeaderCard().create(title, button)
    }

    protected createBody() {
        let body = document.createElement('div')
        body.className = 'd-flex flex-row'

        let left = document.createElement('div')
        body.appendChild(left)
        left.className = 'd-flex flex-column'

        let hostCard = new HostSelectionCard()
        hostCard.bindListener(async (host: string) => {
            this.normalListeners.forEach(value => value(host))
        })
        left.appendChild(hostCard.create(this.host))

        left.appendChild(this.createBaseCard())

        let right = document.createElement('div')
        body.appendChild(right)
        right.className = 'd-flex flex-column col'
        right.appendChild(this.createBuildCard())
        right.appendChild(this.createExtraCard())

        return body
    }

    protected createBaseCard() {
        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'content-page-card'

        let body = document.createElement('div')
        card.appendChild(body)
        body.className = 'card-body flex-column'

        let nameFragment = new EditableInputItem().create(readLocal('ui.content.page.timer.label.name'), this.nameObserver)
        nameFragment.firstElementChild!.classList.add('my-1')
        body.appendChild(nameFragment)

        let delayFragment = new EditableInputItem().create(readLocal('ui.content.page.timer.label.delay'), this.delayObserver)
        delayFragment.firstElementChild!.classList.add('my-1')
        let input = delayFragment.querySelector('[class="form-control"]') as HTMLInputElement
        input.type = 'number'
        body.appendChild(delayFragment)

        let refFragment = new EditableInputItem().create(readLocal('ui.content.page.timer.label.ref'), this.refObserver)
        refFragment.firstElementChild!.classList.add('my-1')
        body.appendChild(refFragment)

        return fragment
    }

    protected createExtraCard() {
        return new MassiveInputCard().create(readLocal('ui.content.page.timer.label.extra'), this.extras)
    }

    protected createBuildCard() {
        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'content-page-card'

        let body = document.createElement('div')
        card.appendChild(body)
        body.className = 'card-body flex-column'

        let f = new EditableInputItem().create(readLocal('ui.content.page.timer.label.profile'), this.profileObserver)
        let input = f.querySelector('[class="form-control"]') as HTMLInputElement
        input.placeholder = 'default'
        body.appendChild(f)

        return fragment
    }

    protected package() {
        let extra = new Map()
        this.extras.forEach((value, key) => {
            extra.set(key, value.get())
        })
        this.extrasKeys.forEach(value => {
            if (!extra.has(value)) extra.set(value, '')
        })
        let config: object
        if (this.profileObserver.get().trim().length > 0) config = {
            profile: this.profileObserver.get(),
            extraParas: Object.fromEntries(extra)
        }
        else config = {
            extraParas: Object.fromEntries(extra)
        }
        return {
            name: this.nameObserver.get(),
            ref: this.refObserver.get(),
            delay: Number(this.delayObserver.get()),
            config: config
        }
    }
}

export {TimerPage}