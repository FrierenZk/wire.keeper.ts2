import {ipcRenderer} from "electron";
import {AlertToast} from "./AlertToast";
import {InfoToast} from "./InfoToast";

class ToastEventListener {
    static init() {
        ipcRenderer.on('ui-toast-show-alert', ((event, args) => {
            new AlertToast(String(args)).show()
        }))

        ipcRenderer.on('ui-toast-show', ((event, args) => {
            new InfoToast(String(args)).show()
        }))
    }
}

export {ToastEventListener}