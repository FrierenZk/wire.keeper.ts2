import {readLocal} from "../../../common/resources";
import {AModal} from "./AModal";

class ConfirmModal extends AModal {
    protected callback: () => void

    constructor(title: string, callback: () => void) {
        super()
        this.title = title
        this.callback = callback
    }

    protected createBody(): HTMLElement | null {
        return null
    }

    protected createBodyContent(): HTMLElement {
        return document.createElement('div')
    }

    protected createFooterContent(): HTMLElement {
        let btnDiv = document.createElement('div')
        btnDiv.className = 'ms-auto me-4 my-0 py-1'

        let cancelBtn = document.createElement('button')
        btnDiv.appendChild(cancelBtn)
        cancelBtn.className = 'btn btn-secondary mx-2'
        cancelBtn.type = 'button'
        cancelBtn.textContent = readLocal('ui.button.cancel')
        cancelBtn.setAttribute('data-bs-dismiss', 'modal')

        let confirmBtn = document.createElement('button')
        btnDiv.appendChild(confirmBtn)
        confirmBtn.className = 'btn btn-primary mx-2'
        confirmBtn.type = 'button'
        confirmBtn.textContent = readLocal('ui.button.confirm')
        confirmBtn.setAttribute('data-bs-dismiss', 'modal')
        confirmBtn.addEventListener('click', ev => {
            this.callback()
            ev.cancelBubble
        })

        return btnDiv
    }
}

export {ConfirmModal}