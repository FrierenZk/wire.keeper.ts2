import {Sidebar} from "./ui/sidebar/Sidebar";
import {Tooltip} from "bootstrap";
import {Content} from "./ui/content/Content";
import {ModalContainer} from "./ui/modal/ModalContainer";
import {ToastContainer} from "./ui/toast/ToastContainer";
import {ToastEventListener} from "./ui/toast/ToastEventListener";

document.getElementById('tail_script')?.remove()

let shadow = document.createElement('div')
shadow.className = 'top-shadow'
document.body.appendChild(shadow)

let main = document.createElement('main')
document.body.appendChild(main)

main.appendChild(Sidebar.create())
main.appendChild(Content.create())

document.body.appendChild(ModalContainer.create())
document.body.appendChild(ToastContainer.create())

ToastEventListener.init()

let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
tooltipTriggerList.map((tooltipTriggerEl) => {
    return new Tooltip(tooltipTriggerEl)
});
