import {Sidebar} from "./ui/sidebar/Sidebar";
import {Tooltip} from "bootstrap";
import {Modals} from "./ui/modals";
import {Toasts} from "./ui/toasts";
import {Content} from "./ui/content/Content";

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

let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map((tooltipTriggerEl) => {
    return new Tooltip(tooltipTriggerEl)
});

function showAddModal() {
    modals.showAddModal()
}

function showConfirmModal(text: string, callback: () => void) {
    modals.showConfirmModal(text, callback)
}

function showAlert(msg: string) {
    toasts.showAlert(msg)
}

function showToast(msg: string) {
    toasts.showToast(msg)
}

export {showAddModal, showConfirmModal, showAlert, showToast}