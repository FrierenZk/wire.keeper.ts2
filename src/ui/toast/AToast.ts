import {IToast} from "./IToast";
import {ToastContainer} from "./ToastContainer";

abstract class AToast implements IToast {
    toast: HTMLElement = document.createElement('div')
    protected msg: string = ''
    protected title: string = ''

    create(): DocumentFragment {
        let fragment = document.createDocumentFragment()
        fragment.appendChild(this.toast)

        this.toast.className = 'toast'
        this.toast.setAttribute('aria-atomic', 'true')
        this.toast.setAttribute('role', 'status')
        this.toast.setAttribute('aria-live', 'polite')

        let header = this.createHeader()
        this.toast.appendChild(header)

        let body = this.createBody()
        this.toast.appendChild(body)

        this.toast.addEventListener('hidden.bs.toast', _ => {
            this.toast.remove()
        })

        return fragment
    }

    show(): void {
        ToastContainer.appendModal(this)
    }

    protected createHeader() {
        let header = document.createElement('div')
        header.className = 'toast-header user-select-none'
        header.textContent = this.title
        return header
    }

    protected createBody() {
        let body = document.createElement('div')
        body.className = 'toast-body user-select-none'
        body.style.paddingLeft = '1.5em'
        body.textContent = this.msg
        return body
    }
}

export {AToast}