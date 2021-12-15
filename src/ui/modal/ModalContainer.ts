import {Modal} from "bootstrap";
import {IModal} from "./IModal";

class ModalContainer {
    protected static container = document.createElement('div')

    static create() {
        return this.container
    }

    static appendModal(modal: IModal) {
        this.container.appendChild(modal.create())
        new Modal(modal.modal).show()
    }
}

export {ModalContainer}