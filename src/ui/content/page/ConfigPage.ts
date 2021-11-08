import {APage} from "./APage";
import {ObserverInputField} from "../../databingding/ObserverInputField";
import {parseMap} from "../../../common/parser";
import {readLocal} from "../../../common/resources";

class ConfigPage extends APage {
    protected mode: string = ''
    protected nameObserver = ObserverInputField.fromString('')
    protected categoryObserver = ObserverInputField.fromString('')
    protected profileObserver = ObserverInputField.fromString('')
    protected svnObserver = ObserverInputField.fromString('')
    protected otherObservers: Map<string, ObserverInputField<any>> = new Map()

    preSet(args: any): void {
        this.mode = args[0]?.mode
        let config = args[0]?.config
        if (config) {
            if (config.name) this.nameObserver = ObserverInputField.fromString(config.name)
            if (config.category) this.categoryObserver = ObserverInputField.fromString(config.category)
            if (config.profile) this.profileObserver = ObserverInputField.fromString(config.profile)
            if (config.extraParas) {
                if (config.extraParas.svn) this.svnObserver = ObserverInputField.fromString(config.extraParas.svn)
                parseMap(JSON.stringify(config.extraParas)).forEach((((value, key) => {
                    if (key != 'svn') {
                        this.otherObservers.set(key, ObserverInputField.fromString(value))
                    }
                })))
            }
            console.log(this.nameObserver)
            console.log(this.categoryObserver)
            console.log(this.profileObserver)
            console.log(this.svnObserver)
            console.log(this.otherObservers)
        }
    }

    public async create() {
        let fragment = document.createDocumentFragment()

        fragment.appendChild(this.createHeader())
        fragment.appendChild(this.createContent())

        return fragment
    }

    public createHeader() {
        let div = document.createElement('div')
        div.className = 'd-flex px-5 mb-2'
        this.cleanList.push(div)

        let header = document.createElement('div')
        div.appendChild(header)
        header.className = 'w-100 border-bottom d-flex align-items-center'

        let title = document.createElement('div')
        header.appendChild(title)
        title.className = 'ps-4 me-auto fs-4 fw-bolder user-select-none'

        let buttonDiv = document.createElement('div')
        header.appendChild(buttonDiv)
        buttonDiv.className = 'd-inline-flex align-items-center py-2 px-4'

        let createBtn = (text: string) => {
            let btn = document.createElement('div')
            buttonDiv.appendChild(btn)
            btn.className = 'btn btn-primary'
            btn.textContent = text
            return btn
        }

        switch (this.mode) {
            case 'run':
                title.textContent = readLocal('ui.content.page.config.title.run')
                let btn = createBtn(readLocal('ui.content.page.config.btn.run'))
                btn.addEventListener('click', (ev) => {
                    //TODO
                    ev.cancelBubble
                })
                break
            case 'edit':
                title.textContent = readLocal('ui.content.page.config.title.edit')
                let btn2 = createBtn(readLocal('ui.content.page.config.btn.save'))
                btn2.addEventListener('click', async (ev) => {
                    //TODO
                    ev.cancelBubble
                })
                break
            default:
                title.textContent = readLocal('ui.content.page.config.title.create')
                let btn3 = createBtn(readLocal('ui.content.page.config.btn.save'))
                btn3.addEventListener('click', async (ev) => {
                    //TODO
                    ev.cancelBubble
                })
                break
        }

        return div
    }

    public createContent() {
        let div = document.createElement('div')
        div.className = 'd-flex flex-row'
        this.cleanList.push(div)

        let infos = document.createElement('div')
        div.appendChild(infos)
        infos.className = 'd-flex flex-column col-4'

        ;[
            {label: "name", field: this.nameObserver},
            {label: "category", field: this.categoryObserver},
            {label: "profile", field: this.profileObserver},
            {label: "svn", field: this.svnObserver}
        ].forEach(value => {
            let card = document.createElement('div')
            infos.appendChild(card)
            card.className = 'content-page-config-card'

            let title = document.createElement('div')
            card.appendChild(title)
            title.className = 'card-header fw-bolder user-select-none'
            title.textContent = value.label


            let body = document.createElement('div')
            card.appendChild(body)
            body.className = 'card-body'

            let form = document.createElement('form')
            body.appendChild(form)

            let inputGroup = document.createElement('div')
            form.appendChild(inputGroup)
            inputGroup.className = 'input-group'

            let input = document.createElement('input')
            inputGroup.appendChild(input)
            input.className = 'form-control'
            input.style.fontSize = '.75rem'
            input.setAttribute('disabled', '')
            input.setAttribute('readonly', '')
            value.field.setBinding(input)

            let checkBtn = document.createElement('button')
            checkBtn.className = 'btn btn-outline-primary p-1'
            checkBtn.type = 'button'
            checkBtn.hidden = false
            checkBtn.innerHTML = `<i class="bi bi-check"></i>`

            let cancelBtn = document.createElement('button')
            cancelBtn.className = 'btn btn-outline-secondary p-1'
            cancelBtn.type = 'button'
            cancelBtn.hidden = false
            cancelBtn.innerHTML = `<i class="bi bi-x"></i>`

            let editBtn = document.createElement('button')
            inputGroup.appendChild(editBtn)
            editBtn.className = 'btn btn-secondary p-1'
            editBtn.type = 'button'
            editBtn.hidden = false
            editBtn.innerHTML = `<i class="bi bi-pencil-square"></i>`

            let textSnapshot: string = ''

            checkBtn.addEventListener('click', ev => {
                inputGroup.removeChild(checkBtn)
                inputGroup.removeChild(cancelBtn)
                inputGroup.appendChild(editBtn)
                input.setAttribute('disabled', '')
                input.setAttribute('readonly', '')
                ev.cancelBubble
            })

            cancelBtn.addEventListener('click', ev => {
                inputGroup.removeChild(checkBtn)
                inputGroup.removeChild(cancelBtn)
                inputGroup.appendChild(editBtn)
                input.value = textSnapshot
                input.setAttribute('disabled', '')
                input.setAttribute('readonly', '')
                ev.cancelBubble
            })

            editBtn.addEventListener('click', ev => {
                inputGroup.removeChild(editBtn)
                inputGroup.appendChild(checkBtn)
                inputGroup.appendChild(cancelBtn)
                textSnapshot = input.value
                input.removeAttribute('disabled')
                input.removeAttribute('readonly')
                input.select()
                ev.cancelBubble
            })
        })

        let extra = document.createElement('div')
        div.appendChild(extra)
        extra.className = 'content-page-config-card col'

        let extraHeader = document.createElement('div')
        extra.appendChild(extraHeader)
        extraHeader.className = 'card-header ms-auto me-0 d-flex flex-row-reverse'

        let extraTitle = document.createElement('div')
        extraHeader.appendChild(extraTitle)
        extraTitle.className = 'fw-bolder ps-2 user-select-none border-start'
        extraTitle.textContent = readLocal('ui.content.page.config.extra.title')

        let extraEditBtn = document.createElement('div')
        extraHeader.appendChild(extraEditBtn)
        extraEditBtn.className = 'extra-btn me-2 px-1'
        extraEditBtn.innerHTML = `<i class="bi bi-pencil-square"></i>`

        let extraCancelBtn = document.createElement('div')
        extraCancelBtn.className = 'extra-btn me-2 px-1'
        extraCancelBtn.innerHTML = `<i class="bi bi-x"></i>`

        let extraBody = document.createElement('div')
        extra.appendChild(extraBody)
        extraBody.className = 'card-body'
        extraBody.style.borderTopLeftRadius = '.5rem'
        extraBody.style.borderTopRightRadius = '0'

        extraEditBtn.addEventListener('click', ev => {
            extraHeader.removeChild(extraEditBtn)
            extraHeader.appendChild(extraCancelBtn)
            ev.cancelBubble
        })

        extraCancelBtn.addEventListener('click', ev => {
            extraHeader.removeChild(extraCancelBtn)
            extraHeader.appendChild(extraEditBtn)
            ev.cancelBubble
        })

        let createItem = (key: string, value: ObserverInputField<any>) => {
            let item = document.createElement('div')
            item.className = 'extra-item d-flex align-items-center justify-content-center'

            let xBtn = document.createElement('div')
            item.appendChild(xBtn)
            xBtn.className = 'extra-x-btn'

            let form = document.createElement('form')
            item.appendChild(form)
            form.className = 'me-1'

            let inputGroup = document.createElement('div')
            form.appendChild(inputGroup)
            inputGroup.className = 'input-group'

            let keyDiv = document.createElement('input')
            inputGroup.appendChild(keyDiv)
            keyDiv.className = 'form-control'
            keyDiv.textContent = key

            let valueDiv = document.createElement('input')
            inputGroup.appendChild(valueDiv)
            valueDiv.className = 'form-control'
            value.setBinding(valueDiv)

            xBtn.addEventListener('click', ev => {
                item.remove()
                ev.cancelBubble
            })

            return item
        }

        let addItem = document.createElement('div')
        extraBody.appendChild(addItem)
        addItem.className = 'extra-item d-flex align-items-center justify-content-center'
        addItem.style.borderBottom = '1px solid #dee2e6'

        let addBtn = document.createElement('div')
        addItem.appendChild(addBtn)
        addBtn.className = 'extra-add-btn'
        addBtn.innerHTML = `<i class="bi bi-plus-circle"></i>`

        addBtn.addEventListener('click', ev => {

            ev.cancelBubble
        })

        return div
    }
}

export {ConfigPage}