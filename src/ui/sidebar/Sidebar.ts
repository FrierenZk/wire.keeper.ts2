import {ipcRenderer} from "electron";
import {ConnectionList} from "./ConnectionList";
import {SearchLabel} from "./SearchLabel";
import {SidebarButtons} from "./SidebarButtons";

class Sidebar {
    static create() {
        return new Sidebar().create()
    }

    create() {
        let div = document.createElement('div')
        div.className = 'side-bar col-3'
        div.appendChild(this.createContent())
        return div
    }

    protected createContent() {
        let fragment = document.createDocumentFragment()

        let buttons = new SidebarButtons()
        let searchLabel = new SearchLabel()
        let connectionList = new ConnectionList()

        let header = document.createElement('h6')
        header.className = 'sidebar-heading border-bottom'
        header.textContent = 'Main'
        fragment.appendChild(header)

        buttons.refresh = () => {
            connectionList.refresh()
        }
        buttons.delete = () => {
            connectionList.delete()
        }
        fragment.appendChild(buttons.create())

        searchLabel.filter = (value) => {
            connectionList.filter(value)
        }
        searchLabel.removeFilter = () => {
            connectionList.removeFilter()
        }
        fragment.appendChild(searchLabel.create())

        fragment.appendChild(connectionList.create())

        let version = document.createElement('div')
        fragment.appendChild(version)
        version.className = 'sidebar-version'
        ipcRenderer.invoke('core-get-version').then(value => {
            version.innerHTML = `<p>ver ${value}</p>`
        })

        return fragment
    }
}

export {Sidebar}