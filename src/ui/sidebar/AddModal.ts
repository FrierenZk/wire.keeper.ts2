import {AModal} from "../modal/AModal";
import {readLocal} from "../../common/resources";
import {ipcRenderer} from "electron";
import {ObserverInputField} from "../databingding/ObserverInputField";
import {showAlert, showToast} from "../../index-renderer";
import {setTimeout} from "timers"

class AddModal extends AModal {
    protected title = readLocal('ui.sidebar.modal.add.title')
    protected inputObserver = ObserverInputField.fromString('')

    protected showWarn() {
    }

    protected createBodyContent(): HTMLElement {
        let body = document.createElement('div')
        body.className = 'd-flex flex-column'

        let label = document.createElement('div')
        body.appendChild(label)
        label.className = 'form-label user-select-none mx-2 my-1'
        label.textContent = readLocal('ui.sidebar.modal.add.address')

        let input = document.createElement('input')
        body.appendChild(input)
        input.className = 'form-control my-1'
        this.inputObserver.setBinding(input)

        this.showWarn = () => {
            label.textContent = readLocal('ui.sidebar.modal.add.warn')
            label.style.color = 'red'
            setTimeout(() => {
                label.textContent = readLocal('ui.sidebar.modal.add.address')
                label.style.color = 'black'
            }, 3000)
        }

        return body
    }

    protected createFooterContent(): HTMLElement {
        let btnDiv = document.createElement('div')
        btnDiv.className = 'd-flex flex-row justify-content-end align-items-center'

        let cancelBtn = document.createElement('button')
        btnDiv.appendChild(cancelBtn)
        cancelBtn.className = 'btn btn-secondary mx-1'
        cancelBtn.setAttribute('data-bs-dismiss', 'modal')
        cancelBtn.textContent = readLocal('ui.button.cancel')

        let saveBtn = document.createElement('button')
        btnDiv.appendChild(saveBtn)
        saveBtn.className = 'btn btn-primary mx-1'
        saveBtn.textContent = readLocal('ui.button.save')
        saveBtn.addEventListener('click', ev => {
            ev.cancelBubble
            if (this.inputObserver.get().trim().length > 0) {
                ipcRenderer.invoke('core-create-connection', this.inputObserver.get()).then(r => {
                    if (r) showAlert(String(r))
                    else showToast(readLocal('ui.sidebar.modal.add.success', this.inputObserver.get()))
                    cancelBtn.click()
                })
            } else this.showWarn()
        })

        return btnDiv
    }

}

export {AddModal}