import {ipcRenderer} from "electron";
import {TabSet} from "./TabSet";

class Content {
    static create() {
        return new Content().create()
    }

    create() {
        let content = document.createElement('div')
        content.className = 'content'
        content.appendChild(this.createTabs())
        return content
    }

    createTabs() {
        let fragment = document.createDocumentFragment()

        let tabSet = new TabSet()
        fragment.appendChild(tabSet.create())

        ipcRenderer.on('ui-select-task', (event, args) => {
            if (args) tabSet.openTaskTab(Array.from(args))
        })

        ipcRenderer.on('ui-open-config-tab', ((event, args) => {
            if (args) tabSet.openConfigurationTab(args)
        }))

        return fragment
    }
}

export {Content}