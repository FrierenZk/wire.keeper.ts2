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
        closet.className = 'd-inline-flex flex-column'

        let card = document.createElement('div')
        closet.appendChild(card)
        card.className = 'content-page-card flex-column'

        let createButton = (icon: HTMLElement, text: string) => {
            let button = document.createElement('div')
            button.appendChild(icon)
            button.className = 'content-page-task-card-item flex-row align-items-center'
            icon.className = 'card-round-btn'
            let t = document.createElement('div')
            t.className = 'user-select-none'
            t.style.fontSize = '0.875rem'
            t.textContent = text
            button.appendChild(t)
            return button
        }

        let play = document.createElement('div')
        play.innerHTML = `
            <svg width="1.5rem" height="1.5rem" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>`
        play.addEventListener('click', ev => {
            ipcRenderer.invoke('core-start-task:' + this.selectHost, this.selectTask).then()
            ev.cancelBubble
        })

        let playForce = document.createElement('div')
        playForce.innerHTML = `
            <svg width="1.5rem" height="1.5rem" fill="currentColor" class="bi bi-reply-fill" viewBox="0 0 16 16">
                <path d="M5.921 11.9 1.353 8.62a.719.719 0 0 1 0-1.238L5.921 4.1A.716.716 0 0 1 7 4.719V6c1.5 0 6 0 7 8-2.5-4.5-7-4-7-4v1.281c0 .56-.606.898-1.079.62z"/>
            </svg>`
        playForce.addEventListener('click', ev => {
            ipcRenderer.invoke('core-start-task-force:' + this.selectHost, this.selectTask).then()
            ev.cancelBubble
        })

        let customPlay = document.createElement('div')
        customPlay.innerHTML = `
            <svg width="1.5rem" height="1.5rem" fill="currentColor" class="bi bi-justify-left" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M2 12.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
            </svg>`
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
        timer.innerHTML = `
            <svg width="1.25rem" height="1.25rem" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16">
                <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
                <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
                <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
            </svg>`
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
        refresh.innerHTML = `
            <svg width="1.25rem" height="1.25rem" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>`
        refresh.addEventListener('click', ev => {
            if (this.updateInfo) this.updateInfo(this.selectHost, this.selectTask)
            ev.cancelBubble
        })

        let edit = document.createElement('div')
        edit.innerHTML = `
            <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
            </svg>`
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
        create.innerHTML = `
            <svg width="1.25rem" height="1.25rem" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
            </svg>`
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
        del.innerHTML = `
            <svg width="1.25rem" height="1.25rem" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
            </svg>`
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
        card.className = 'flex-column content-page-card w-100'

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
            textDiv.className = 'info-text'
            textDiv.textContent = text

            let clipboard = `
                <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>`
            let clipboard2 = `
                <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-clipboard-check" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                </svg>`

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