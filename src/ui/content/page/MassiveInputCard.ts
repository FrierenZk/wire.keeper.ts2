import {ObserverInputField} from "../../databingding/ObserverInputField";
import {ConfirmModal} from "../../modal/ConfirmModal";
import {readLocal} from "../../../common/resources";
import {clipboard} from "electron";
import {Tooltip} from "../../Tooltip";
import {AlertToast} from "../../toast/AlertToast";

class MassiveInputCard {
    create(title: string, map: Map<string, ObserverInputField<any>>) {
        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'content-page-card'

        let body = document.createElement('div')
        card.appendChild(body)
        body.className = 'card-body flex-column'
        body.innerHTML = `<h5 class="font-monospace border-bottom pe-2 py-1 mb-4 fw-bold user-select-none" style="text-align: right">${title}</h5>`

        let inputDiv = document.createElement('div')
        body.appendChild(inputDiv)
        inputDiv.className = 'd-flex flex-column border mx-2 mb-2'
        inputDiv.style.borderRadius = '2em'


        let createItem = (key: string, value: ObserverInputField<any>) => {
            let div = document.createElement('div')
            div.className = 'd-flex flex-row align-items-center justify-content-around border-bottom mx-2 px-2 py-1'

            let preBtn = document.createElement('div')
            div.appendChild(preBtn)
            preBtn.className = 'btn-cs-circle mx-1'
            preBtn.style.fontSize = '1em'
            preBtn.innerHTML = `<i class="bi bi-chevron-bar-right"></i>`
            let prevTip = Tooltip.set(preBtn, readLocal('ui.content.page.massivecard.more'))

            let deleteBtn = document.createElement('div')
            deleteBtn.className = 'btn-cs-circle text-danger mx-1'
            deleteBtn.style.fontSize = '1em'
            deleteBtn.innerHTML = `<i class="bi bi-node-minus"></i>`
            let deleteTip = Tooltip.set(deleteBtn, readLocal('ui.content.page.massivecard.delete'))

            let cancelDelBtn = document.createElement('dv')
            cancelDelBtn.className = 'btn-cs-circle mx-1'
            cancelDelBtn.style.fontSize = '1em'
            cancelDelBtn.innerHTML = `<i class="bi bi-chevron-left"></i>`
            let cancelDelTip = Tooltip.set(cancelDelBtn, readLocal('ui.content.page.massivecard.cancel'))

            preBtn.addEventListener('click', ev => {
                ev.cancelBubble
                div.insertBefore(deleteBtn, preBtn)
                div.insertBefore(cancelDelBtn, preBtn)
                div.removeChild(preBtn)
                prevTip.hide()
            })

            deleteBtn.addEventListener('click', ev => {
                ev.cancelBubble
                new ConfirmModal(readLocal('ui.content.page.massivecard.delete.confirm', key), () => {
                    map.delete(key)
                    div.remove()
                }).show()
                deleteTip.hide()
            })

            cancelDelBtn.addEventListener('click', ev => {
                ev.cancelBubble
                div.insertBefore(preBtn, cancelDelBtn)
                div.removeChild(deleteBtn)
                div.removeChild(cancelDelBtn)
                cancelDelTip.hide()
            })

            div.appendChild(this.createInput('key', key, true))
            let valueDiv = this.createInput('value', value, true)
            div.appendChild(valueDiv)

            let input = valueDiv.lastElementChild

            let editBtn = document.createElement('div')
            div.appendChild(editBtn)
            editBtn.className = 'btn-cs-circle mx-1'
            editBtn.style.fontSize = '1em'
            editBtn.innerHTML = `<i class="bi bi-text-indent-left"></i>`
            let editTip = Tooltip.set(editBtn, readLocal('ui.content.page.massivecard.edit'))

            let saveBtn = document.createElement('div')
            saveBtn.className = 'btn-cs-circle mx-1'
            saveBtn.style.fontSize = '1em'
            saveBtn.innerHTML = `<i class="bi bi-check"></i>`
            let saveTip = Tooltip.set(saveBtn, readLocal('ui.content.page.massivecard.save'))

            let cancelBtn = document.createElement('div')
            cancelBtn.className = 'btn-cs-circle mx-1'
            cancelBtn.style.fontSize = '1em'
            cancelBtn.innerHTML = `<i class="bi bi-x"></i>`
            let cancelTip = Tooltip.set(cancelBtn, readLocal('ui.content.page.massivecard.cancel'))

            let tmp = value.get()
            editBtn.addEventListener('click', ev => {
                ev.cancelBubble
                tmp = value.get()
                if (input instanceof HTMLInputElement) {
                    input.removeAttribute('readonly')
                    input.removeAttribute('disabled')
                } else console.error('Invalid input type')
                div.insertBefore(saveBtn, editBtn)
                div.insertBefore(cancelBtn, editBtn)
                div.removeChild(editBtn)
                editTip.hide()
            })

            saveBtn.addEventListener('click', ev => {
                ev.cancelBubble
                div.insertBefore(editBtn, cancelBtn)
                div.removeChild(saveBtn)
                div.removeChild(cancelBtn)
                saveTip.hide()
                if (input instanceof HTMLInputElement) {
                    input.setAttribute('readonly', '')
                    input.setAttribute('disabled', '')
                } else console.error('Invalid input type')
            })

            cancelBtn.addEventListener('click', ev => {
                ev.cancelBubble
                value.set(tmp)
                cancelTip.hide()
                saveBtn.click()
            })

            return div
        }
        map.forEach((value, key) => inputDiv.appendChild(createItem(key, value)))


        let editItem = document.createElement('div')
        editItem.className = 'd-flex align-items-center justify-content-around border-bottom mx-2 px-2 py-1'

        let editKey = ObserverInputField.fromString('')
        editItem.appendChild(this.createInput('key', editKey, false))
        let editValue = ObserverInputField.fromString('')
        editItem.appendChild(this.createInput('value', editValue, false))

        let editBtnDiv = document.createElement('div')
        editItem.appendChild(editBtnDiv)
        editBtnDiv.className = 'd-inline-flex flex-row align-items-center px-2'

        let editSaveBtn = document.createElement('div')
        editBtnDiv.appendChild(editSaveBtn)
        editSaveBtn.className = 'btn-cs-circle mx-1'
        editSaveBtn.innerHTML = `<i class="bi bi-check"></i>`
        let editSaveTip = Tooltip.set(editSaveBtn, readLocal('ui.content.page.massivecard.save'))
        editSaveBtn.addEventListener('click', ev => {
            ev.cancelBubble
            if (editKey.get().trim().length == 0) {
                new AlertToast(readLocal('ui.content.page.massivecard.key.alert')).show()
                return
            }
            if (editValue.get().trim().length == 0) {
                new AlertToast(readLocal('ui.content.page.massivecard.value.alert')).show()
                return
            }
            if (!map.has(editKey.get())) {
                let field = ObserverInputField.fromString(editValue.get())
                map.set(editKey.get(), field)
                inputDiv.insertBefore(createItem(editKey.get(), field), editItem)
            } else new ConfirmModal(readLocal('ui.content.page.massivecard.duplicate.confirm', editKey.get()),
                () => map.get(editKey.get())?.set(editValue.get())).show()
            editCancelBtn.click()
            editSaveTip.hide()
        })

        let editCancelBtn = document.createElement('div')
        editBtnDiv.appendChild(editCancelBtn)
        editCancelBtn.className = 'btn-cs-circle mx-1'
        editCancelBtn.innerHTML = `<i class="bi bi-x"></i>`
        let editCancelTip = Tooltip.set(editCancelBtn, readLocal('ui.content.page.massivecard.cancel'))
        editCancelBtn.addEventListener('click', ev => {
            ev.cancelBubble
            inputDiv.removeChild(editItem)
            editKey.set('')
            editValue.set('')
            editCancelTip.hide()
        })

        let addItem = document.createElement('div')
        inputDiv.appendChild(addItem)
        addItem.className = 'd-flex align-items-center justify-content-center mx-2 px-2 py-1'

        let addBtn = document.createElement('div')
        addItem.appendChild(addBtn)
        addBtn.className = 'btn-cs-circle'
        addBtn.innerHTML = `<i class="bi bi-plus-circle"></i>`
        Tooltip.set(addBtn, readLocal('ui.content.page.massivecard.add'))

        addBtn.addEventListener('click', ev => {
            ev.cancelBubble
            inputDiv.insertBefore(editItem, addItem)
        })

        return fragment
    }

    protected createInput(title: string, observer: ObserverInputField<any> | string, readonly: boolean = false) {
        let div = document.createElement('div')
        div.className = 'col flex-row position-relative py-2 mx-2'
        div.innerHTML = `<span class="badge bg-primary rounded-pill position-absolute user-select-none px-1" style="z-index: 1; left: 1em; top: -.125em; font-size: .625em">${title}</span>`

        let input = document.createElement('input')
        div.appendChild(input)
        input.className = 'form-control form-control-sm position-relative mx-1'
        input.setAttribute('tooltip', readLocal('ui.content.page.massivecard.input.click'))
        if (observer instanceof ObserverInputField) observer.setBinding(input)
        else input.value = observer
        if (readonly) {
            input.setAttribute('disabled', '')
            input.setAttribute('readonly', '')
        }
        input.addEventListener('dblclick', ev => {
            ev.cancelBubble
            input.select()
            if (observer instanceof ObserverInputField) clipboard.writeText(observer.get())
            else clipboard.writeText(observer)
        })

        return div
    }
}

export {MassiveInputCard}