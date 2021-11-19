import {APage} from "./APage";
import {ipcRenderer, IpcRendererEvent} from "electron";
import {readLocal} from "../../../common/resources";
import {parseMap} from "../../../common/parser";
import {showConfirmModal} from "../../../index-renderer";

class TaskPage extends APage {
    protected updateListeners: Array<(host: string, task: string) => void> = []
    protected updateInfo: ((host: string, task: string) => void) | null = null

    protected selectHost: string = 'None'
    protected selectTask: string = 'None'

    preSet(args: any): void {
        if (args) try {
            let arr = Array.from<string>(args)
            this.selectHost = arr[0]
            this.selectTask = arr[1]
        } catch (e) {
            console.error(e)
        }
    }

    public async create() {
        let fragment = document.createDocumentFragment()

        fragment.appendChild(this.createHeader())
        fragment.appendChild(this.createBody())

        this.bindRendererListeners('ui-select-task', (event: IpcRendererEvent, args: any) => {
            try {
                this.selectHost = args[0]
                this.selectTask = args[1]
                this.updateListeners.forEach(value => value(this.selectHost, this.selectTask))
            } catch (e) {
                console.error(e)
            }
        })

        return fragment
    }

    protected createHeader() {
        let fragment = document.createDocumentFragment()

        let content = document.createElement('div')
        fragment.appendChild(content)
        this.cleanList.push(content)
        content.className = 'd-flex flex-column row-12'

        content.appendChild(this.createLabel())

        return fragment
    }

    protected createBody() {
        let fragment = document.createDocumentFragment()

        let content = document.createElement('div')
        fragment.appendChild(content)
        this.cleanList.push(content)
        content.className = 'd-flex flex-row row-12'

        content.appendChild(this.createButtons())
        content.appendChild(this.createInfo())

        return fragment
    }

    protected createLabel() {
        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'content-page-card flex-column'

        let title = document.createElement('div')
        card.appendChild(title)
        title.className = 'content-page-task-card-item'

        let titleHeader = document.createElement('div')
        title.appendChild(titleHeader)
        titleHeader.className = 'header'
        titleHeader.textContent = readLocal('ui.content.page.task.title')

        let titleContent = document.createElement('div')
        title.appendChild(titleContent)
        titleContent.className = 'body'
        let update = ((host: string, task: string) => titleContent.textContent = `${host} / ${task}`)
        update(this.selectHost, this.selectTask)
        this.updateListeners.push(update)

        return fragment
    }

    protected createButtons() {
        let fragment = document.createDocumentFragment()

        let closet = document.createElement('div')
        fragment.appendChild(closet)
        closet.className = 'd-inline-flex flex-column col-4'

        let card = document.createElement('div')
        closet.appendChild(card)
        card.className = 'content-page-card flex-column'

        let createButton = (icon: HTMLElement, text: string) => {
            let button = document.createElement('div')
            button.appendChild(icon)
            button.className = 'content-page-task-card-item flex-row align-items-center'
            icon.className = 'card-round-btn'
            let t = document.createElement('div')
            t.className = 'user-select-none col'
            t.style.fontSize = '0.875rem'
            t.style.wordBreak = 'break-all'
            t.textContent = text
            button.appendChild(t)
            return button
        }

        let play = document.createElement('div')
        play.innerHTML = `<i class="bi bi-play-fill" style="font-size: 1.5em"></i>`
        play.addEventListener('click', ev => {
            ipcRenderer.invoke('core-start-task:' + this.selectHost, this.selectTask).then()
            ev.cancelBubble
        })

        let playForce = document.createElement('div')
        playForce.innerHTML = `<i class="bi bi-reply-fill" style="font-size: 1.5em"></i>`
        playForce.addEventListener('click', ev => {
            ipcRenderer.invoke('core-start-task-force:' + this.selectHost, this.selectTask).then()
            ev.cancelBubble
        })

        let customPlay = document.createElement('div')
        customPlay.innerHTML = `<i class="bi bi-justify-left" style="font-size: 1.5em"></i>`
        customPlay.addEventListener('click', async (ev) => {
            let r = await ipcRenderer.invoke('core-get-task-info:' + this.selectHost, this.selectTask)
            ipcRenderer.invoke('core-call-self-event', 'ui-open-config-tab', {
                'mode': 'run',
                'config': r,
                'host': this.selectHost
            }).then()
            ev.cancelBubble
        })

        let timer = document.createElement('div')
        timer.innerHTML = `<i class="bi bi-clock-history" style="font-size: 1.25em"></i>`
        timer.addEventListener('click', ev => {
            //TODO
            ev.cancelBubble
        })

        ;[
            {icon: play, title: readLocal('ui.content.page.task.play')},
            {icon: playForce, title: readLocal('ui.content.page.task.replay')},
            {icon: customPlay, title: readLocal('ui.content.page.task.custom.play')},
            {icon: timer, title: readLocal('ui.content.page.task.timer')}
        ].forEach(value => card.appendChild(createButton(value.icon, value.title)))

        let card2 = document.createElement('div')
        closet.appendChild(card2)
        card2.className = 'content-page-card flex-column'

        let refresh = document.createElement('div')
        refresh.innerHTML = `<i class="bi bi-arrow-clockwise" style="font-size: 1.25em"></i>`
        refresh.addEventListener('click', ev => {
            if (this.updateInfo) this.updateInfo(this.selectHost, this.selectTask)
            ev.cancelBubble
        })

        let edit = document.createElement('div')
        edit.innerHTML = `<i class="bi bi-pencil-fill"></i>`
        edit.addEventListener('click', async (ev) => {
            let r = await ipcRenderer.invoke('core-get-task-info:' + this.selectHost, this.selectTask)
            ipcRenderer.invoke('core-call-self-event', 'ui-open-config-tab', {
                'mode': 'edit',
                'config': r,
                'host': this.selectHost
            }).then()
            ev.cancelBubble
        })

        let create = document.createElement('div')
        create.innerHTML = `<i class="bi bi-plus-lg" style="font-size: 1.25em"></i>`
        create.addEventListener('click', async (ev) => {
            let r = await ipcRenderer.invoke('core-get-task-info:' + this.selectHost, this.selectTask)
            ipcRenderer.invoke('core-call-self-event', 'ui-open-config-tab', {
                'mode': 'create',
                'config': r,
                'host': this.selectHost
            }).then()
            ev.cancelBubble
        })

        let del = document.createElement('dvi')
        del.innerHTML = `<i class="bi bi-trash-fill" style="font-size: 1.25em"></i>`
        del.addEventListener('click', ev => {
            showConfirmModal(readLocal('ui.content.page.task.delete.confirm', this.selectHost, this.selectTask), () => {
                ipcRenderer.invoke('core-delete-config:' + this.selectHost, this.selectTask).then()
            })
            ev.cancelBubble
        })

        ;[
            {icon: refresh, title: readLocal('ui.content.page.task.refresh')},
            {icon: edit, title: readLocal('ui.content.page.task.edit')},
            {icon: create, title: readLocal('ui.content.page.task.create')},
            {icon: del, title: readLocal('ui.content.page.task.delete')},
        ].forEach(value => card2.appendChild(createButton(value.icon, value.title)))

        del.classList.add('alert-btn')

        return fragment
    }

    protected createInfo() {
        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'flex-column content-page-card col'

        let header = document.createElement('div')
        card.appendChild(header)
        header.className = 'content-page-task-card-item flex-row align-items-center'

        let text = document.createElement('div')
        header.appendChild(text)
        text.className = 'info-header'
        text.textContent = readLocal('ui.content.page.task.info')

        let createItem = (title: string, text: string) => {
            let div = document.createElement('div')
            card.appendChild(div)
            div.className = 'content-page-task-card-item flex-row info-item-div'

            let titleDiv = document.createElement('div')
            div.appendChild(titleDiv)
            titleDiv.className = 'info-title'
            titleDiv.textContent = title

            let textDiv = document.createElement('div')
            div.appendChild(textDiv)
            textDiv.className = 'info-text col'
            textDiv.textContent = text

            let clipboard = `<i class="bi bi-clipboard"></i>`
            let clipboard2 = `<i class="bi bi-clipboard-check"></i>`

            let paste = document.createElement('div')
            div.appendChild(paste)
            paste.className = 'info-paste'
            paste.innerHTML = clipboard
            paste.addEventListener('click', async (ev) => {
                await navigator.clipboard.writeText(text)
                paste.innerHTML = clipboard2
                setTimeout(() => paste.innerHTML = clipboard, 1500)
                ev.cancelBubble
            })
        }

        this.updateInfo = (host: string, task: string) => {
            ipcRenderer.invoke('core-get-task-info:' + host, task).then(r => {
                if (r) {
                    Array.from(card.getElementsByClassName('info-item-div')).forEach(value => value.remove())
                    createItem('name', r.name)
                    createItem('category', r.category)
                    createItem('profile', r.profile)
                    if (r.extraParas) parseMap(JSON.stringify(r.extraParas)).forEach((value, key) => createItem(key, value))
                }
            })
        }

        try {
            this.updateInfo(this.selectHost, this.selectTask)
        } catch (ignore) {
        }
        this.updateListeners.push(this.updateInfo)

        return fragment
    }
}

export {TaskPage}