import {ObserverInputField} from "../../databingding/ObserverInputField";
import {readLocal} from "../../../common/resources";
import {Tooltip} from "../../Tooltip";

class EditableInputItem {
    create(title: string, observer: ObserverInputField<any>) {
        let fragment = document.createDocumentFragment()

        let inputGroup = document.createElement('div')
        fragment.appendChild(inputGroup)
        inputGroup.className = 'input-group'
        inputGroup.innerHTML = `<span class="input-group-text user-select-none fw-bold">${title}</span>`

        let input = document.createElement('input')
        inputGroup.appendChild(input)
        input.className = 'form-control'
        input.setAttribute('disabled', '')
        input.setAttribute('readonly', '')
        observer.setBinding(input)

        let editBtn = document.createElement('button')
        inputGroup.appendChild(editBtn)
        editBtn.type = 'button'
        editBtn.className = 'btn btn-outline-primary px-2'
        editBtn.setAttribute('data-bs-toggle', 'tooltip')
        editBtn.innerHTML = `<i class="bi bi-text-indent-left"></i>`
        let editTip = Tooltip.set(editBtn, readLocal('ui.content.page.input.edit'))

        let checkBtn = document.createElement('button')
        checkBtn.type = 'button'
        checkBtn.className = 'btn btn-outline-primary px-2'
        checkBtn.setAttribute('data-bs-toggle', 'tooltip')
        checkBtn.innerHTML = `<i class="bi bi-check"></i>`
        let checkTip = Tooltip.set(checkBtn, readLocal('ui.content.page.input.save'))

        let xBtn = document.createElement('button')
        xBtn.type = 'button'
        xBtn.className = 'btn btn-outline-danger px-2'
        xBtn.setAttribute('data-bs-toggle', 'tooltip')
        xBtn.innerHTML = `<i class="bi bi-x"></i>`
        let xTip = Tooltip.set(xBtn, readLocal('ui.content.page.input.cancel'))

        let tmp = observer.get()
        editBtn.addEventListener('click', ev => {
            ev.cancelBubble
            tmp = observer.get()
            inputGroup.removeChild(editBtn)
            inputGroup.appendChild(checkBtn)
            inputGroup.appendChild(xBtn)
            input.removeAttribute('disabled')
            input.removeAttribute('readonly')
            editTip.hide()
        })

        checkBtn.addEventListener('click', ev => {
            ev.cancelBubble
            inputGroup.removeChild(checkBtn)
            inputGroup.removeChild(xBtn)
            inputGroup.appendChild(editBtn)
            input.setAttribute('disabled', '')
            input.setAttribute('readonly', '')
            checkTip.hide()
        })

        xBtn.addEventListener('click', ev => {
            ev.cancelBubble
            observer.set(tmp)
            xTip.hide()
            checkBtn.click()
        })

        return fragment
    }
}

export {EditableInputItem}