import {Sidebar} from "./ui/sidebar/Sidebar";
import {Tooltip} from "bootstrap";
import {Modals} from "./ui/modals";
import {Toasts} from "./ui/toasts";
import {Content} from "./ui/content/Content";
import {ModalContainer} from "./ui/modal/ModalContainer";

document.getElementById('tail_script')?.remove()

let shadow = document.createElement('div')
shadow.className = 'top-shadow'
document.body.appendChild(shadow)

let main = document.createElement('main')
document.body.appendChild(main)

main.appendChild(Sidebar.create())
main.appendChild(Content.create())

let modals = new Modals()
modals.init(document.body)

let toasts = new Toasts()
toasts.init(document.body)

document.body.appendChild(ModalContainer.create())

let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map((tooltipTriggerEl) => {
    return new Tooltip(tooltipTriggerEl)
});

function showAddModal() {
    modals.showAddModal()
}

function showAlert(msg: string) {
    toasts.showAlert(msg)
}

function showToast(msg: string) {
    toasts.showToast(msg)
}

export {showAddModal, showAlert, showToast}