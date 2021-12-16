import {AToast} from "./AToast";

class AlertToast extends AToast {
    protected title = 'Alert'

    constructor(msg: string) {
        super();
        this.msg = msg
    }

    create(): DocumentFragment {
        let toast = super.create();

        this.toast.setAttribute('role', 'alert')
        this.toast.setAttribute('aria-live', 'assertive')
        this.toast.setAttribute('data-bs-autohide', 'false')

        return toast
    }


    protected createHeader(): HTMLDivElement {
        let header = super.createHeader()
        header.classList.add('d-flex')
        header.classList.add('align-items-center')
        header.innerHTML = `<div class="rounded me-2" style="height: 0.5rem;width: 0.5rem;background-color: red"></div>
                            <strong class="me-auto user-select-none">${this.title}</strong>
                            <small class="user-select-none">${new Date().toLocaleTimeString()}</small>
                            <button class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>`
        return header
    }
}

export {AlertToast}