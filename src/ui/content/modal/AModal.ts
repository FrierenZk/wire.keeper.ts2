import {ModalContainer} from "./ModalContainer";
import {IModal} from "./IModal";

abstract class AModal implements IModal {
    modal = document.createElement('div')
    protected dialog = document.createElement('div')
    protected content = document.createElement('div')
    protected title = ''

    create(): DocumentFragment {
        let fragment = document.createDocumentFragment()

        fragment.appendChild(this.modal)
        this.modal.className = 'modal fade'
        this.modal.tabIndex = -1

        this.modal.appendChild(this.dialog)
        this.dialog.className = 'modal-dialog d-flex align-items-center h-75'

        this.dialog.appendChild(this.content)
        this.content.className = 'modal-content'

        let header = this.createHeader(this.title)
        if (header) this.content.appendChild(header)

        let body = this.createBody()
        if (body) this.content.appendChild(body)

        let footer = this.createFooter()
        if (footer) this.content.appendChild(footer)

        this.modal.addEventListener('hidden.bs.modal', _ => {
            this.modal.remove()
        })

        return fragment
    }

    show() {
        ModalContainer.appendModal(this)
    }

    protected createHeader(title: string): HTMLElement | null {
        let header = document.createElement('div')
        header.className = 'modal-header'

        let text = document.createElement('h5')
        header.appendChild(text)
        text.textContent = title
        text.className = 'modal-title'

        let x = document.createElement('button')
        header.appendChild(x)
        x.type = 'button'
        x.className = 'btn-close me-2'
        x.setAttribute('data-bs-dismiss', 'modal')
        x.setAttribute('aria-label', 'Close')

        return header
    }

    protected createBody(): HTMLElement | null {
        let body = document.createElement('div')
        body.className = 'modal-body'
        body.appendChild(this.createBodyContent())

        return body
    }

    protected createFooter(): HTMLElement | null {
        let footer = document.createElement('div')
        footer.className = 'modal-footer'
        footer.appendChild(this.createFooterContent())

        return footer
    }

    protected abstract createBodyContent(): HTMLElement

    protected abstract createFooterContent(): HTMLElement
}

export {AModal}