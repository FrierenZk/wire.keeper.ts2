import {Modal} from 'bootstrap'
import {readLocal} from "../common/resources";
import {randomId} from "./random";
import {ipcRenderer} from "electron";

class Modals {
    protected modalContainer = document.createElement('div')

    public init(parent: HTMLElement) {
        parent.appendChild(this.modalContainer)
    }

    public showAddModal() {
        let body = document.createElement('div')
        let labelId = randomId('modal')
        let textId = randomId('modal')
        body.innerHTML =
            `<label for="${textId}" class="form-label" id="${labelId}">${readLocal('ui.modals.add.address')}</label>` +
            `<input type="text" class="form-control" id="${textId}" placeholder value required>`
        let footer = document.createElement('div')
        let saveBtnId = randomId('modal')
        footer.innerHTML =
            `<button class="btn btn-secondary" data-bs-dismiss="modal">${readLocal('ui.button.cancel')}</button>` +
            `<button class="btn btn-primary" id="${saveBtnId}">${readLocal('ui.button.save')}</button>`
        let modal = this.buildModal(readLocal('ui.modals.add.title'), body, footer)
        footer.remove()
        body.remove()
        modal.onkeydown = (key) => {
            if (key.code === 'Enter') document.getElementById(saveBtnId)!!.click()
        }
        let t = new Modal(modal)
        document.getElementById(saveBtnId)!!.onclick = () => {
            let text = (<HTMLInputElement>document.getElementById(textId))?.value
            console.log(text)
            if (Number(text?.trim().length) > 0) {
                ipcRenderer.send('core-create-connection', text)
                t.hide()
            } else {
                let label = document.getElementById(labelId)
                if (label) {
                    label.textContent = readLocal('ui.modals.add.error')
                    let color = label.style.color
                    label.style.color = '#dc3545'
                    setTimeout(() => {
                        label!!.textContent = readLocal('ui.modals.add.address')
                        label!!.style.color = color
                    }, 500)
                }
            }
        }
        t.show()
    }

    public showConfirmModal(text: string, callback: () => void) {
        let footer = document.createElement('div')
        let confirmId = randomId('modal')
        footer.innerHTML =
            `<button class="btn btn-secondary" data-bs-dismiss="modal">${readLocal('ui.button.cancel')}</button>` +
            `<button class="btn btn-primary" id="${confirmId}">${readLocal('ui.button.confirm')}</button>`
        let modal = this.buildModal(text, null, footer)
        let t = new Modal(modal)
        modal.getElementsByClassName('modal-dialog').item(0)?.classList.add('modal-sm')
        document.getElementById(confirmId)!!.onclick = () => {
            callback()
            t.hide()
        }
        t.show()
    }

    protected buildModal(title: string, body: HTMLElement | null = null, footer: HTMLElement | null = null): HTMLDivElement {
        let modal = document.createElement('div')
        this.modalContainer.appendChild(modal)
        modal.className = 'modal fade'
        modal.tabIndex = -1
        modal.innerHTML =
            `<div class="modal-dialog">` +
            `   <div class="modal-content">` +
            `       <div class="modal-header">` +
            `           <h5 class="modal-title">${title}</h5>` +
            `           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>` +
            `       </div>` +
            `${body ? `<div class="modal-body">${body?.innerHTML}</div>` : ''}` +
            `${footer ? `<div class="modal-footer">${footer?.innerHTML}</div>` : ''}` +
            `   </div>` +
            `</div>`
        modal.addEventListener('hidden.bs.modal', () => {
            setTimeout(() => {
                this.modalContainer.removeChild(modal)
                modal.remove()
            }, 500)
        })
        return modal
    }
}

export {Modals}