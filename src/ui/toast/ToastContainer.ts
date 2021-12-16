import {Toast} from "bootstrap";
import {IToast} from "./IToast";

class ToastContainer {
    protected static container = document.createElement('div')

    static create() {
        this.container.className = 'toast-container position-fixed bottom-0 end-0 p-3'
        this.container.style.zIndex = '5'
        return this.container
    }

    static appendModal(toast: IToast) {
        this.container.appendChild(toast.create())
        new Toast(toast.toast).show()
    }
}

export {ToastContainer}