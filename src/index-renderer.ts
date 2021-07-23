import {Sidebar} from "./ui/sidebar";
import {Tooltip} from "bootstrap";
import {Modals} from "./ui/modals";
import {Toasts} from "./ui/toasts";

document.getElementById('tail_script')?.remove()

let shadow = document.createElement('div')
shadow.className = 'top-shadow'
document.body.appendChild(shadow)

let main = document.createElement('main')
document.body.appendChild(main)

let sideBar = document.createElement('div')
sideBar.className = 'side-bar'
main.appendChild(sideBar)
sideBar.appendChild(Sidebar.createFragment())

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