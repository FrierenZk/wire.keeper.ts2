import {ObserverInputField} from "../../databingding/ObserverInputField";
import {readLocal} from "../../../common/resources";

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
        editBtn.title = readLocal('ui.content.page.input.edit')
        editBtn.innerHTML = `<i class="bi bi-text-indent-left"></i>`

        let checkBtn = document.createElement('button')
        checkBtn.type = 'button'
        checkBtn.className = 'btn btn-outline-primary px-2'
        checkBtn.setAttribute('data-bs-toggle', 'tooltip')
        checkBtn.title = readLocal('ui.content.page.input.save')
        checkBtn.innerHTML = `<i class="bi bi-check"></i>`

        let xBtn = document.createElement('button')
        xBtn.type = 'button'
        xBtn.className = 'btn btn-outline-danger px-2'
        xBtn.setAttribute('data-bs-toggle', 'tooltip')
        xBtn.title = readLocal('ui.content.page.input.cancel')
        xBtn.innerHTML = `<i class="bi bi-x"></i>`

        let tmp = observer.get()
        editBtn.addEventListener('click', ev => {
            ev.cancelBubble
            tmp = observer.get()
            inputGroup.removeChild(editBtn)
            inputGroup.appendChild(checkBtn)
            inputGroup.appendChild(xBtn)
            input.removeAttribute('disabled')
            input.removeAttribute('readonly')
        })

        checkBtn.addEventListener('click', ev => {
            ev.cancelBubble
            inputGroup.removeChild(checkBtn)
            inputGroup.removeChild(xBtn)
            inputGroup.appendChild(editBtn)
            input.setAttribute('disabled', '')
            input.setAttribute('readonly', '')
        })

        xBtn.addEventListener('click', ev => {
            ev.cancelBubble
            observer.set(tmp)
            checkBtn.click()
        })

        return fragment
    }
}

export {EditableInputItem}