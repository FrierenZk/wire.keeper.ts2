import {Toast} from "bootstrap";
import {ipcRenderer} from "electron";

class Toasts {
    protected toastContainer = document.createElement('div')

    public init(parent: HTMLElement) {
        parent.appendChild(this.toastContainer)
        this.toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3'
        this.toastContainer.style.zIndex = '5'

        ipcRenderer.on('ui-toast-show', ((event, args) => {
            this.showToast(args)
        }))
        ipcRenderer.on('ui-toast-show-alert', ((event, args) => {
            this.showAlert(args)
        }))
    }

    public showToast(msg: string) {
        let toast = this.buildToast(msg, 'Info')
        toast.setAttribute('role', 'status')
        toast.setAttribute('aria-live', 'polite')
        let t = new Toast(toast)
        toast.onclick = () => {
            setTimeout(() => {
                t.hide()
            }, 200)
        }
        t.show()
    }

    public showAlert(msg: string) {
        let toast = this.buildToast(msg, 'Alert', true, '#dc3545')
        toast.setAttribute('role', 'alert')
        toast.setAttribute('aria-live', 'assertive')
        toast.setAttribute('data-bs-autohide', 'false')
        new Toast(toast).show()
    }

    protected buildToast(msg: string, type: string, hasX: boolean = false, color: string = '#0d6efd'): HTMLDivElement {
        let toast = document.createElement('div')
        this.toastContainer.appendChild(toast)
        toast.className = 'toast'
        toast.setAttribute('aria-atomic', 'true')
        toast.addEventListener('hidden.bs.toast', async () => {
            setTimeout(async () => {
                this.toastContainer.removeChild(toast)
                toast.remove()
            }, 3000)
        })
        toast.innerHTML =
            `<div class="toast-header">
                <div class="rounded me-2" style="height: 0.5rem;width: 0.5rem;background-color: ${color}"></div>
                <strong class="me-auto">${type}</strong>
                <small>${new Date().toLocaleTimeString()}</small>
            ${(hasX ?
                '<button class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>' :
                '')}
            </div>
            <div class="toast-body" style="padding-left: 1.5rem">${msg}</div>`
        return toast
    }
}

export {Toasts}