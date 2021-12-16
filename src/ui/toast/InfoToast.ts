import {AToast} from "./AToast";
import {waitUntil} from "../../common/coroutines";

class InfoToast extends AToast {
    protected title = 'Info'
    protected close = document.createElement('button')

    constructor(msg: string) {
        super();
        this.msg = msg
    }

    create(): DocumentFragment {
        this.toast.addEventListener('click', ev => {
            ev.cancelBubble
            waitUntil(() => false, 300).then(_ => {
                this.close.click()
            })
        })
        return super.create();
    }

    protected createHeader(): HTMLDivElement {
        let header = super.createHeader();
        header.innerHTML = `<div class="rounded me-2" style="height: 0.5rem;width: 0.5rem;background-color: dodgerblue"></div>
                            <strong class="me-auto">${this.title}</strong>
                            <small>${new Date().toLocaleTimeString()}</small>`

        header.appendChild(this.close)
        this.close.hidden = true
        this.close.className = 'btn-close'
        this.close.setAttribute('data-bs-dismiss', 'toast')
        this.close.setAttribute('aria-label', 'Close')

        return header
    }
}

export {InfoToast}