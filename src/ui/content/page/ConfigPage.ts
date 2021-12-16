import {APage} from "./APage";
import {ObserverInputField} from "../../databingding/ObserverInputField";
import {parseMap} from "../../../common/parser";
import {readLocal} from "../../../common/resources";
import {ipcRenderer} from "electron";
import {ConfirmModal} from "../../modal/ConfirmModal";
import {HostSelectionCard} from "./HostSelectionCard";
import {HeaderCard} from "./HeaderCard";

class ConfigPage extends APage {
    protected mode: string = ''
    protected host: string = ''
    protected nameObserver = ObserverInputField.fromString('')
    protected categoryObserver = ObserverInputField.fromString('')
    protected profileObserver = ObserverInputField.fromString('')
    protected svnObserver = ObserverInputField.fromString('')
    protected otherObservers: Map<string, ObserverInputField<any>> = new Map()

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
        let div = document.createElement('div')
        div.className = 'd-flex flex-row row'
        this.cleanList.push(div)

        let infos = document.createElement('div')
        div.appendChild(infos)
        infos.className = 'd-flex flex-column col-4'

        let hostCard = new HostSelectionCard()
        hostCard.bindListener(async (host: string) => {
            this.host = host
        })
        infos.appendChild(hostCard.create(this.host))

        ;[
            {label: "name", field: this.nameObserver},
            {label: "category", field: this.categoryObserver},
            {label: "profile", field: this.profileObserver},
            {label: "svn", field: this.svnObserver}
        ].forEach(value => {
            let card = document.createElement('div')
            infos.appendChild(card)
            card.className = 'content-page-config-card row-12'

            let title = document.createElement('div')
            card.appendChild(title)
            title.className = 'card-header fw-bolder user-select-none row-12'
            title.textContent = value.label


            let body = document.createElement('div')
            card.appendChild(body)
            body.className = 'card-body row-12'

            let form = document.createElement('form')
            body.appendChild(form)

            let inputGroup = document.createElement('div')
            form.appendChild(inputGroup)
            inputGroup.className = 'input-group'

            let input = document.createElement('input')
            inputGroup.appendChild(input)
            input.className = 'form-control'
            input.style.fontSize = '.75em'
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

            if (this.nameObserver == value.field && this.mode == 'edit') inputGroup.removeChild(editBtn)

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

        div.appendChild(this.createExtras())

        return div
    }

    protected createExtras() {
        let extra = document.createElement('div')
        extra.className = 'content-page-config-card col'

        let extraHeader = document.createElement('div')
        extra.appendChild(extraHeader)
        extraHeader.className = 'card-header ms-auto me-0 d-flex flex-row-reverse row-12'

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
        extraBody.className = 'card-body row-12'
        extraBody.style.borderTopLeftRadius = '.5em'
        extraBody.style.borderTopRightRadius = '0'

        let btnMap: Map<string, HTMLDivElement> = new Map()

        extraEditBtn.addEventListener('click', ev => {
            extraHeader.removeChild(extraEditBtn)
            extraHeader.appendChild(extraCancelBtn)
            btnMap.forEach((value, _) => {
                value.hidden = false
            })
            ev.cancelBubble
        })

        extraCancelBtn.addEventListener('click', ev => {
            extraHeader.removeChild(extraCancelBtn)
            extraHeader.appendChild(extraEditBtn)
            btnMap.forEach((value, _) => {
                value.hidden = true
            })
            ev.cancelBubble
        })

        let cssText = 'font-size: 0.625em;color: dodgerblue;left: 1em;top: -.5em;text-align: center;background-color: white;border-radius: .5em;'

        let createInput = (title: string, field: ObserverInputField<any> | null = null, readonly: boolean = false, value: string = '') => {
            let div = document.createElement('div')
            div.className = 'd-flex position-relative'

            let titleDiv = document.createElement('div')
            div.appendChild(titleDiv)
            titleDiv.className = 'user-select-none position-absolute px-1'
            titleDiv.style.cssText = cssText
            titleDiv.textContent = title

            let valueDiv = document.createElement('input')
            div.appendChild(valueDiv)
            valueDiv.className = 'form-control'
            valueDiv.style.fontSize = '.75em'

            if (readonly) {
                valueDiv.setAttribute('disabled', '')
                valueDiv.setAttribute('readonly', '')
                valueDiv.value = value
            } else if (field) field.setBinding(valueDiv)

            return div
        }

        let createNewItem = (key: string, value: ObserverInputField<any>) => {
            let item = document.createElement('div')
            item.className = 'extra-item d-flex align-items-center justify-content-around py-2'

            let xBtn = document.createElement('div')
            item.appendChild(xBtn)
            xBtn.className = 'btn-cs-circle mx-2'
            xBtn.style.color = 'red'
            xBtn.hidden = true
            xBtn.innerHTML = '<i class="bi bi-node-minus"></i>'
            btnMap.set(key, xBtn)

            let keyDiv = createInput('Key', null, true, key)
            item.appendChild(keyDiv)
            keyDiv.classList.add('col')
            keyDiv.classList.add('mx-2')

            let form = document.createElement('form')
            item.appendChild(form)
            form.className = 'col mx-2'

            let valueDiv = createInput('Value', value)
            form.appendChild(valueDiv)

            let setDisabled = () => {
                Array.from(valueDiv.children).forEach(el => {
                    if (el instanceof HTMLInputElement) {
                        el.setAttribute('disabled', '')
                        el.setAttribute('readonly', '')
                    }
                })
            }

            let setEnabled = () => {
                Array.from(valueDiv.children).forEach(el => {
                    if (el instanceof HTMLInputElement) {
                        el.removeAttribute('disabled')
                        el.removeAttribute('readonly')
                    }
                })
            }
            setDisabled()

            let btnDiv = document.createElement('div')
            item.appendChild(btnDiv)
            btnDiv.className = 'd-flex flex-row align-items-center mx-2'

            let editBtn = document.createElement('div')
            btnDiv.appendChild(editBtn)
            editBtn.className = 'btn-cs-circle'
            editBtn.innerHTML = '<i class="bi bi-text-indent-right"></i>'

            let checkBtn = document.createElement('div')
            checkBtn.className = 'btn-cs-circle mx-1'
            checkBtn.innerHTML = '<i class="bi bi-check"></i>'

            let cancelBtn = document.createElement('div')
            cancelBtn.className = 'btn-cs-circle mx-1'
            cancelBtn.style.color = 'gray'
            cancelBtn.innerHTML = '<i class="bi bi-x"></i>'

            xBtn.addEventListener('click', ev => {
                new ConfirmModal(readLocal('ui.content.page.config.extra.item.delete', key), () => {
                    item.remove()
                    this.otherObservers.delete(key)
                    btnMap.delete(key)
                }).show()
                ev.cancelBubble
            })

            let tmp = value.get()

            editBtn.addEventListener('click', ev => {
                tmp = value.get()
                setEnabled()
                btnDiv.appendChild(checkBtn)
                btnDiv.appendChild(cancelBtn)
                btnDiv.removeChild(editBtn)
                ev.cancelBubble
            })

            cancelBtn.addEventListener('click', ev => {
                setDisabled()
                value.set(tmp)
                btnDiv.removeChild(checkBtn)
                btnDiv.removeChild(cancelBtn)
                btnDiv.appendChild(editBtn)
                ev.cancelBubble
            })

            checkBtn.addEventListener('click', ev => {
                setDisabled()
                btnDiv.removeChild(checkBtn)
                btnDiv.removeChild(cancelBtn)
                btnDiv.appendChild(editBtn)
                ev.cancelBubble
            })

            return item
        }

        this.otherObservers.forEach(((value, key) => {
            extraBody.appendChild(createNewItem(key, value))
        }))

        let createItem = document.createElement('div')
        createItem.className = 'extra-item d-flex flex-row justify-content-around'

        let keyDiv = document.createElement('div')
        createItem.appendChild(keyDiv)
        keyDiv.className = 'd-flex position-relative my-2 mx-2 col'

        let keyTitle = document.createElement('div')
        keyDiv.appendChild(keyTitle)
        keyTitle.className = 'user-select-none position-absolute px-1'
        keyTitle.textContent = 'Key'
        keyTitle.style.cssText = cssText

        let keyValue = document.createElement('input')
        keyDiv.appendChild(keyValue)
        keyValue.className = 'form-control'
        keyValue.style.fontSize = '.75em'

        let valueDiv = document.createElement('div')
        createItem.appendChild(valueDiv)
        valueDiv.className = keyDiv.className

        let valueTitle = document.createElement('div')
        valueDiv.appendChild(valueTitle)
        valueTitle.className = keyTitle.className
        valueTitle.textContent = 'Value'
        valueTitle.style.cssText = cssText

        let valueValue = document.createElement('input')
        valueDiv.appendChild(valueValue)
        valueValue.className = keyValue.className
        valueValue.style.fontSize = keyValue.style.fontSize

        let btnDiv = document.createElement('div')
        createItem.appendChild(btnDiv)
        btnDiv.className = 'd-flex flex-row align-items-center justify-content-around mx-2'

        let createConfirmBtn = document.createElement('div')
        btnDiv.appendChild(createConfirmBtn)
        createConfirmBtn.className = 'btn-cs-circle mx-1'
        createConfirmBtn.innerHTML = '<i class="bi bi-check"></i>'

        let createCancelBtn = document.createElement('div')
        btnDiv.appendChild(createCancelBtn)
        createCancelBtn.className = 'btn-cs-circle mx-1'
        createCancelBtn.innerHTML = '<i class="bi bi-x"></i>'
        createCancelBtn.style.color = 'gray'

        let addItem = document.createElement('div')
        extraBody.appendChild(addItem)
        addItem.className = 'extra-item d-flex align-items-center justify-content-center'
        addItem.style.borderBottom = '1px solid #dee2e6'

        let addBtn = document.createElement('div')
        addItem.appendChild(addBtn)
        addBtn.className = 'extra-add-btn'
        addBtn.innerHTML = `<i class="bi bi-plus-circle"></i>`

        createCancelBtn.addEventListener('click', ev => {
            extraBody.removeChild(createItem)
            keyValue.value = ''
            valueValue.value = ''
            ev.cancelBubble
        })

        createConfirmBtn.addEventListener('click', ev => {
            if (this.otherObservers.has(keyValue.value)) {
                keyTitle.textContent = readLocal('ui.content.page.config.extra.create.error')
                keyTitle.style.color = 'red'
                setTimeout(() => {
                    keyTitle.textContent = 'Key'
                    keyTitle.style.color = 'dodgerblue'
                }, 3000)
            } else if (keyValue.value.trim().length == 0 || valueValue.value.trim().length == 0) {
                if (keyValue.value.trim().length == 0) {
                    keyTitle.textContent = readLocal('ui.content.page.config.extra.create.empty.key')
                    keyTitle.style.color = 'red'
                    setTimeout(() => {
                        keyTitle.textContent = 'Key'
                        keyTitle.style.color = 'dodgerblue'
                    }, 3000)
                }
                if (valueValue.value.trim().length == 0) {
                    valueTitle.textContent = readLocal('ui.content.page.config.extra.create.empty.value')
                    valueTitle.style.color = 'red'
                    setTimeout(() => {
                        valueTitle.textContent = 'Value'
                        valueTitle.style.color = 'dodgerblue'
                    }, 3000)
                }
            } else {
                let field = ObserverInputField.fromString(valueValue.value)
                this.otherObservers.set(keyValue.value, field)
                extraBody.insertBefore(createNewItem(keyValue.value, field), createItem)
                createCancelBtn.click()
                ev.cancelBubble
            }
        })

        addBtn.addEventListener('click', ev => {
            extraBody.insertBefore(createItem, addItem)
            ev.cancelBubble
        })

        return extra
    }

    protected package() {
        let extra = new Map<string, any>()
        extra.set('svn', this.svnObserver.get())
        this.otherObservers.forEach((value, key) => {
            extra.set(key, value.get())
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