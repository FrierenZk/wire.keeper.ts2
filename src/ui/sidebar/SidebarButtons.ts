import {readLocal} from "../../common/resources";
import {ipcRenderer} from "electron";
import {AddModal} from "./AddModal";

class SidebarButtons {
    public refresh: (() => void) | null = null
    public delete: (() => void) | null = null

    public create() {
        let fragment = document.createDocumentFragment()

        let buttons = document.createElement('div')
        buttons.className = 'sidebar-btn-group border-bottom'
        fragment.appendChild(buttons)

        let refreshBtn = document.createElement('button')
        refreshBtn.title = readLocal('ui.sidebar.refresh')
        refreshBtn.innerHTML = `
            <svg width="16" height="16" fill="currentColor" class="bi bi-bootstrap-reboot" viewBox="0 0 16 16">
                <path d="M1.161 8a6.84 6.84 0 1 0 6.842-6.84.58.58 0 1 1 0-1.16 8 8 0 1 1-6.556 3.412l-.663-.577a.58.58 0 0 1 .227-.997l2.52-.69a.58.58 0 0 1 .728.633l-.332 2.592a.58.58 0 0 1-.956.364l-.643-.56A6.812 6.812 0 0 0 1.16 8z"/>
                <path d="M6.641 11.671V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352h1.141zm0-3.75V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324h-1.6z"/>
            </svg>`
        refreshBtn.onclick = () => {
            if (this.refresh) this.refresh()
        }
        ipcRenderer.on('ui-sidebar-refresh-button', () => refreshBtn.click())
        buttons.appendChild(refreshBtn)

        let splitter = document.createElement('div')
        splitter.className = 'splitter'
        buttons.appendChild(splitter)

        let addBtn = document.createElement('button')
        addBtn.title = readLocal('ui.sidebar.add')
        addBtn.innerHTML = `
            <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>`
        addBtn.addEventListener('click', ev => {
            new AddModal().show()
            ev.cancelBubble
        })
        ipcRenderer.on('ui-sidebar-add-button', () => addBtn.click())
        buttons.appendChild(addBtn)

        let xBtn = document.createElement('button')
        xBtn.title = readLocal('ui.sidebar.delete')
        xBtn.innerHTML = `
            <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`
        xBtn.onclick = () => {
            if (this.delete) this.delete()
        }
        ipcRenderer.on('ui-sidebar-x-button', () => xBtn.click())
        buttons.appendChild(xBtn)

        ;[refreshBtn, addBtn, xBtn].forEach(value => {
            value.className = 'sidebar-btn'
            value.setAttribute('data-bs-toggle', 'tooltip')
            value.setAttribute('data-bs-placement', 'top')
        })

        return fragment
    }
}

export {SidebarButtons}