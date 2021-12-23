import {APage} from "./APage";
import {ipcRenderer} from "electron";
import {randomId} from "../../random";
import {readLocal} from "../../../common/resources";
import {parseMap} from "../../../common/parser";
import {setTimeout, setInterval} from "timers"
import {ConfirmModal} from "../../modal/ConfirmModal";
import {HostSelectionCard} from "./HostSelectionCard";

class ListPage extends APage {
    protected undoSelect: Array<() => void> = []
    protected refresh: Array<() => void> = []
    protected updateDetail: ((type: string, item: string, host: string) => void) | null = null

    remove() {
        clearInterval(this.timer)
        super.remove();
    }

    public async create(): Promise<DocumentFragment> {
        let fragment = document.createDocumentFragment()

        let div = document.createElement('div')
        fragment.appendChild(div)
        div.className = 'd-flex flex-row'

        div.appendChild(this.createDetail())
        div.appendChild(this.createList())

        return fragment
    }

    preSet(args: any): void {
    }

    protected knock: () => void = () => {
    }

    protected timer: NodeJS.Timeout = setInterval(() => {
        this.knock()
    }, 1000)

    protected createDetail() {
        let card = document.createElement('div')
        card.className = 'content-page-card col'
        card.innerHTML = '<p class="card-body user-select-none"> </p>'

        let currentType = ''
        let currentItem = ''
        let currentHost = ''

        this.updateDetail = (type, item, host) => {
            if (currentType === type && currentItem == item && currentHost == host) return
            currentType = type
            currentItem = item
            currentHost = host
            while (card.hasChildNodes()) card.removeChild(card.lastChild!)
            switch (type) {
                case 'task':
                    card.appendChild(this.createTaskDetails(item, host))
                    break
                case 'timer':
                    card.appendChild(this.createTimerDetails(item, host))
                    break
                default:
                    break
            }
        }

        return card
    }

    protected createInfoBubble(key: string, value: any) {
        let fragment = document.createDocumentFragment()

        let div = document.createElement('div')
        fragment.appendChild(div)
        div.className = 'info-bubble'

        let label = document.createElement('div')
        div.appendChild(label)
        label.className = 'bubble-label'
        label.textContent = key

        if (typeof value === 'object') {
            new Map(Object.entries(value)).forEach((v, k) => {
                div.appendChild(this.createInfoBubble(String(k), v))
            })
        } else {
            let textDiv = document.createElement('div')
            div.appendChild(textDiv)
            textDiv.className = 'bubble-text'
            textDiv.style.minWidth = `${key.length / 2}em`

            let text = document.createElement('div')
            textDiv.appendChild(text)
            text.textContent = String(value)

            let clipHtml = '<i class="bi bi-clipboard"></i>'
            let clipHtml2 = '<i class="bi bi-clipboard-check"></i>'
            let clipboard = document.createElement('div')
            textDiv.appendChild(clipboard)
            clipboard.className = 'paste'
            clipboard.innerHTML = clipHtml
            clipboard.addEventListener('click', async (ev) => {
                await navigator.clipboard.writeText(String(text.textContent))
                clipboard.innerHTML = clipHtml2
                setTimeout(() => clipboard.innerHTML = clipHtml, 3000)
                ev.cancelBubble
            })
        }

        return fragment
    }

    protected createTaskDetails(task: string, host: string) {
        let fragment = document.createDocumentFragment()


        //Details card

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'card-body flex-column mb-4'

        let labelDiv = document.createElement('div')
        card.appendChild(labelDiv)
        labelDiv.className = 'd-flex flex-row'
        labelDiv.innerHTML = `<h3 class="mx-2 user-select-none">${readLocal('ui.content.page.list.task.info.label')}</h3>`

        let statusDiv = document.createElement('div')
        labelDiv.appendChild(statusDiv)
        statusDiv.className = 'd-flex flex-row align-items-center ms-auto'

        let icon = document.createElement('div')
        statusDiv.appendChild(icon)
        icon.className = 'd-flex'
        icon.style.maxHeight = '1.5em'
        icon.style.maxWidth = '1.5em'

        let statusText = document.createElement('div')
        statusDiv.appendChild(statusText)
        statusText.className = 'px-2 border-end user-select-none'

        let stopBtn = document.createElement('div')
        statusDiv.appendChild(stopBtn)
        stopBtn.className = 'btn btn-sm btn-danger mx-2'
        stopBtn.textContent = readLocal('ui.content.page.list.task.info.stop')
        stopBtn.addEventListener('click', async (ev) => {
            let name = await ipcRenderer.invoke('core-get-task-name:' + host, task)
            new ConfirmModal(readLocal('ui.content.page.list.task.info.stop.confirm', name),
                () => ipcRenderer.invoke('core-stop-task:' + host, task).then()).show()
            ev.cancelBubble
        })

        let deleteBtn = document.createElement('div')
        statusDiv.appendChild(deleteBtn)
        deleteBtn.className = 'btn btn-sm btn-danger mx-2'
        deleteBtn.textContent = readLocal('ui.content.page.list.task.info.delete')
        deleteBtn.addEventListener('click', async (ev) => {
            let name = await ipcRenderer.invoke('core-get-task-name:' + host, task)
            new ConfirmModal(readLocal('ui.content.page.list.task.info.delete.confirm', name),
                async () => {
                    await ipcRenderer.invoke('core-delete-logs', host, task, name)
                    this.undoSelect.forEach(value => value())
                    this.refresh.forEach(value => value())
                    if (this.updateDetail) this.updateDetail('', '', '')
                }).show()
            ev.cancelBubble
        })

        this.knock = () => {
            ipcRenderer.invoke('core-get-task-status:' + host, task).then(r => {
                statusText.textContent = String(r)
                switch (String(r)) {
                    case "Working" || "Waiting for Server":
                        icon.innerHTML = `<div class="spinner-border spinner-border-sm text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div>`
                        stopBtn.hidden = false
                        deleteBtn.hidden = true
                        break
                    case "Error":
                        icon.innerHTML = `<div class="btn-close" style="pointer-events: none; user-select: none"></div>`
                        break
                    default:
                        icon.innerHTML = `<div style="border-radius: 50%; color: dodgerblue"></div>`
                        stopBtn.hidden = true
                        deleteBtn.hidden = false
                        break
                }
            })
        }
        this.knock()


        let infoDiv = document.createElement('div')
        card.appendChild(infoDiv)
        infoDiv.className = 'd-flex flex-wrap border-top p-1'
        infoDiv.style.minHeight = '1px'

        ipcRenderer.invoke('core-get-task-config:' + host, task).then(r => {
            parseMap(r).forEach((value, key) => {
                infoDiv.appendChild(this.createInfoBubble(key, value))
            })
        })

        //Logs card

        let card2 = document.createElement('div')
        fragment.appendChild(card2)
        card2.className = 'card-body d-flex flex-column my-2'
        card2.innerHTML = `<h3 class="mx-2 user-select-none">${readLocal('ui.content.page.list.task.log.label')}</h3>`

        let buttons = document.createElement('div')
        card2.appendChild(buttons)
        buttons.className = 'ms-auto p-2'

        let intervalGroup = document.createElement('div')
        buttons.appendChild(intervalGroup)
        intervalGroup.className = 'btn-group mx-2'

        let intervalDisplay = document.createElement('button')
        intervalGroup.appendChild(intervalDisplay)
        intervalDisplay.type = 'button'
        intervalDisplay.className = 'btn btn-primary btn-sm'

        intervalDisplay.textContent = readLocal('ui.content.page.list.task.log.before') +
            readLocal('ui.content.page.list.task.log.interval.closed')

        let intervalDropdown = document.createElement('button')
        intervalGroup.appendChild(intervalDropdown)
        intervalDropdown.type = 'button'
        intervalDropdown.className = 'btn btn-primary btn-sm dropdown-toggle dropdown-toggle-split'
        intervalDropdown.setAttribute('data-bs-toggle', 'dropdown')
        intervalDropdown.setAttribute('aria-expanded', 'false')
        intervalDropdown.id = randomId('dropdown')

        let intervalMenu = document.createElement('ul')
        intervalGroup.appendChild(intervalMenu)
        intervalMenu.className = 'dropdown-menu'

        let showBtn = document.createElement('button')
        buttons.appendChild(showBtn)
        showBtn.className = 'btn btn-primary btn-sm mx-2'
        showBtn.type = 'button'
        showBtn.textContent = readLocal('ui.content.page.list.task.log.button.show')

        let hideBtn = document.createElement('button')
        buttons.appendChild(hideBtn)
        hideBtn.className = 'btn btn-primary btn-sm mx-2'
        hideBtn.type = 'button'
        hideBtn.hidden = true
        hideBtn.textContent = readLocal('ui.content.page.list.task.log.button.hide')

        class LogNav {
            listeners: Array<(_: number) => void> = []
            protected activeNum = 0
            protected numButtons: Array<HTMLLIElement> = []
            protected ul = document.createElement('ul')
            protected prev = document.createElement('li')
            protected next = document.createElement('li')

            create() {
                this.ul.className = 'pagination pagination-sm col flex-wrap mx-2 my-0'
                this.ul.appendChild(this.prev)
                this.ul.appendChild(this.next)

                this.prev.className = 'page-item'
                this.prev.innerHTML = '<a class="page-link" href="#"><span aria-hidden="true">&laquo;</span></a>'
                this.next.className = 'page-item'
                this.next.innerHTML = '<a class="page-link" href="#"><span aria-hidden="true">&raquo;</span></a>'

                this.prev.addEventListener('click', ev => {
                    this.numButtons[0]?.click()
                    ev.cancelBubble
                })
                this.next.addEventListener('click', ev => {
                    this.numButtons[this.numButtons.length - 1]?.click()
                    ev.cancelBubble
                })
                return this.ul
            }

            updatePageNum(n: number) {
                if (n != this.numButtons.length) {
                    this.numButtons.forEach(value => value.remove())
                    let arr = []
                    let fragment = document.createDocumentFragment()
                    for (let i = 1; i <= n; i++) {
                        let li = document.createElement('li')
                        fragment.appendChild(li)
                        li.className = 'page-item'
                        li.innerHTML = `<a class="page-link" href="#">${i}</a>`
                        li.addEventListener('click', (ev => {
                            ev.cancelBubble
                            this.updateActive(i)
                            this.listeners.forEach(value => value(i))
                        }))
                        arr.push(li)
                    }
                    this.numButtons = arr
                    this.ul.insertBefore(fragment, this.next)
                }
            }

            updateActive(n: number) {
                if (n <= this.numButtons.length && n > 0) {
                    this.numButtons[n - 1].classList.add('active')
                    this.activeNum = n
                    this.deactivateOthers()
                }
            }

            protected deactivateOthers() {
                this.numButtons.forEach((value, index) => {
                    if (this.activeNum - 1 != index) value.classList.remove('active')
                })
            }
        }

        let logContainer = document.createElement('div')
        card2.appendChild(logContainer)
        logContainer.className = 'flex-column p-2 border'
        logContainer.style.display = 'none'

        let headButtons = document.createElement('div')
        logContainer.appendChild(headButtons)
        headButtons.className = 'd-inline-flex flex-row align-items-center ms-auto p-2'
        headButtons.style.overflowX = 'auto'

        let refreshBtn = document.createElement('div')
        headButtons.appendChild(refreshBtn)
        refreshBtn.className = 'btn btn-sm btn-primary mx-2'
        refreshBtn.textContent = readLocal('ui.content.page.list.task.log.refresh')

        let saveBtn = document.createElement('div')
        headButtons.appendChild(saveBtn)
        saveBtn.className = 'btn btn-sm btn-primary mx-2'
        saveBtn.textContent = readLocal('ui.content.page.list.task.log.save')

        let clearBtn = document.createElement('div')
        headButtons.appendChild(clearBtn)
        clearBtn.className = 'btn btn-sm btn-danger mx-2'
        clearBtn.textContent = readLocal('ui.content.page.list.task.log.clear')

        let nav1 = new LogNav()
        headButtons.appendChild(nav1.create())

        let logDiv = document.createElement('div')
        logContainer.appendChild(logDiv)
        logDiv.className = 'log-div'

        let logText = document.createElement('div')
        logDiv.appendChild(logText)
        logText.className = 'log-text'

        let bottomButtons = document.createElement('div')
        logContainer.appendChild(bottomButtons)
        bottomButtons.className = 'd-inline-flex align-items-center ms-auto p-2'

        let nav2 = new LogNav()
        bottomButtons.appendChild(nav2.create())

        //Logs card interaction

        let hisPage = 1

        let listener = (n: number) => {
            hisPage = n
            ipcRenderer.invoke('core-get-logs', host, task, n - 1).then(r => {
                if (logText.innerHTML != r) logText.innerHTML = r
            })
        }

        nav1.listeners.push((n) => {
            nav2.updateActive(n)
            listener(n)
        })
        nav2.listeners.push((n) => {
            nav1.updateActive(n)
            listener(n)
        })

        let logTimer: NodeJS.Timeout | null = null
        let interval = 10
        let count = 0


        let updateLogs = () => {
            ipcRenderer.invoke('core-get-log-size', host, task).then(r => {
                let update = (n: number) => {
                    nav1.updatePageNum(n)
                    nav2.updatePageNum(n)

                    nav1.updateActive(hisPage)
                    nav2.updateActive(hisPage)

                    listener(hisPage)
                }
                if (Number(r) > 0) update(Number(r))
                else update(1)
            })
            count = 0
        }
        let setTimeout = (t: number) => {
                if (t > 0) {
                    interval = t
                    if (logTimer === null) {
                        logTimer = setInterval(() => {
                            count = count + 1
                            if (count >= interval) updateLogs()
                        }, 100)
                    }
                } else if (logTimer) {
                    clearInterval(logTimer)
                    logTimer = null
                }
            }

        ;[
            {label: readLocal('ui.content.page.list.task.log.interval.closed'), t: -1},
            {label: readLocal('ui.content.page.list.task.log.interval.milliseconds', "500"), t: 5},
            {label: readLocal('ui.content.page.list.task.log.interval.second'), t: 10},
            {label: readLocal('ui.content.page.list.task.log.interval.seconds', "3"), t: 30},
            {label: readLocal('ui.content.page.list.task.log.interval.seconds', "5"), t: 50},
            {label: readLocal('ui.content.page.list.task.log.interval.seconds', "10"), t: 100}
        ].forEach(value => {
            let li = document.createElement('li')
            li.textContent = value.label
            li.addEventListener('click', () => {
                setTimeout(value.t)
                intervalDisplay.textContent = readLocal('ui.content.page.list.task.log.before') +
                    value.label
            })
            li.className = 'dropdown-item user-select-none'
            intervalMenu.appendChild(li)
        })

        showBtn.addEventListener('click', ev => {
            hideBtn.hidden = false
            showBtn.hidden = true
            logContainer.style.display = 'flex'
            ev.cancelBubble
        })

        hideBtn.addEventListener('click', ev => {
            hideBtn.hidden = true
            showBtn.hidden = false
            logContainer.style.display = 'none'
            ev.cancelBubble
        })

        refreshBtn.addEventListener('click', ev => {
            updateLogs()
            ev.cancelBubble
        })

        saveBtn.addEventListener('click', ev => {
            ipcRenderer.invoke('core-save-logs', host, task).then()
            ev.cancelBubble
        })

        clearBtn.addEventListener('click', ev => {
            ipcRenderer.invoke('core-clear-logs', host, task).then(updateLogs)
            ev.cancelBubble
        })

        updateLogs()

        return fragment
    }

    protected createTimerDetails(timer: string, host: string) {
        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'card-body flex-column'

        let label = document.createElement('div')
        card.appendChild(label)
        label.className = 'd-flex flex-row align-items-center'
        label.innerHTML = `<h3 class="mx-2 user-select-none">${readLocal('ui.content.page.list.timer.info.label')}</h3>`

        let refreshBtn = document.createElement('div')
        label.appendChild(refreshBtn)
        refreshBtn.className = 'ms-auto btn-cs-circle shadow-sm'
        refreshBtn.innerHTML = `<i class="bi bi-arrow-clockwise" style="font-size: .875em"></i>`

        let buttonsDiv = document.createElement('div')
        card.appendChild(buttonsDiv)
        buttonsDiv.className = 'd-flex flex-wrap border-top py-2 align-items-center justify-content-evenly'

        ;[{
            label: readLocal('ui.content.page.list.timer.info.edit'),
            icon: `<i class="bi bi-wrench"></i>`,
            callback: () => {
                // TODO: open timer config tab
            }
        }, {
            label: readLocal('ui.content.page.list.timer.info.delete'),
            icon: `<i class="bi bi-x-circle-fill"></i>`,
            callback: () => new ConfirmModal(readLocal('ui.content.page.list.timer.info.confirm', timer), () => {
                ipcRenderer.invoke('core-delete-timer:' + host, timer).then()
            }).show(), color: 'red'
        }].forEach(value => {
            let div = document.createElement('div')
            buttonsDiv.appendChild(div)
            div.className = 'd-inline-flex flex-row align-items-center border border-2 rounded-pill shadow-sm m-1 px-4 py-1'

            let btn = document.createElement('div')
            div.appendChild(btn)
            btn.className = 'btn-cs-circle shadow-sm'
            btn.innerHTML = value.icon
            if (value.color) btn.style.color = value.color
            btn.addEventListener('click', ev => {
                value.callback()
                ev.cancelBubble
            })

            let text = document.createElement('div')
            div.appendChild(text)
            text.className = 'user-select-none mx-2'
            text.textContent = value.label
        })

        let infoDiv = document.createElement('div')
        card.appendChild(infoDiv)
        infoDiv.className = 'd-flex flex-wrap border-top py-1 px-4'
        infoDiv.style.minHeight = '1em'

        let update = () => {
            ipcRenderer.invoke('core-get-timer-config:' + host, timer).then(r => {
                while (infoDiv.hasChildNodes()) infoDiv.removeChild(infoDiv.lastChild!)
                parseMap(r).forEach((value, key) => {
                    infoDiv.appendChild(this.createInfoBubble(key, value))
                })
            })
        }
        refreshBtn.addEventListener('click', ev => {
            ev.cancelBubble
            update()
        })
        update()

        return fragment
    }

    protected createList() {
        let div = document.createElement('div')
        div.className = 'col-4'
        div.appendChild(this.createLabel())
        div.appendChild(this.createTask())
        div.appendChild(this.createTimer())

        return div
    }

    protected createLabel() {
        let hostCard = new HostSelectionCard()
        hostCard.bindListener(async (host: string) => {
            this.normalListeners.forEach(value => value(host))
        })
        return hostCard.create(null)
    }

    protected createItemListCard() {
        let card = document.createElement('div')
        card.className = 'content-page-card row'

        let body = document.createElement('div')
        card.appendChild(body)
        body.className = 'card-body flex-column'

        let label = document.createElement('div')
        body.appendChild(label)
        label.className = 'd-flex flex-row pb-2 align-items-center'

        let text = document.createElement('div')
        label.appendChild(text)
        text.className = 'text-wrap fw-bolder text-decoration-underline user-select-none ps-4 pe-2'
        text.textContent = readLocal('ui.content.page.list.task.label')

        let refreshBtn = document.createElement('div')
        label.appendChild(refreshBtn)
        refreshBtn.className = 'btn-cs-circle shadow-sm'
        refreshBtn.style.fontSize = '.875em'
        refreshBtn.innerHTML = `<i class="d-flex bi bi-arrow-clockwise"></i>`

        let list = document.createElement('ul')
        body.appendChild(list)
        list.className = 'list-group px-2'
        list.innerHTML = `<li class="list-group-item list-group-item-action active" aria-current="true">example</li>
            <li class="list-group-item list-group-item-action">example2</li>`

        this.undoSelect.push(() => {
            Array.from(list.children).forEach(value => value.classList.remove('active'))
        })

        return {card, list, refreshBtn}
    }

    protected createTask() {
        let object = this.createItemListCard()
        let lastHost = ''
        let selected = ''

        let listener = (host: string) => {
            if (host.trim().length > 0) {
                lastHost = host
                ipcRenderer.invoke('core-get-task-list:' + host).then(r => {
                    while (object.list.hasChildNodes()) object.list.removeChild(object.list.lastChild!)
                    Array.from(r).forEach(value => {
                        let li = document.createElement('li')
                        object.list.appendChild(li)
                        ipcRenderer.invoke('core-get-task-name:' + host, value).then(r => li.textContent = String(r))
                        li.className = 'list-group-item list-group-item-action user-select-none'
                        li.setAttribute('data-bs-toggle', 'list')
                        li.setAttribute('role', 'tab')
                        if (value === selected) li.classList.add('active')
                        li.addEventListener('click', async (ev) => {
                            this.undoSelect.forEach(value => value())
                            li.classList.add('active')
                            selected = String(value)
                            if (this.updateDetail && li.textContent) this.updateDetail('task', String(value), lastHost)
                            ev.cancelBubble
                        })
                    })
                    if (!object.list.hasChildNodes()) object.list.innerHTML = '<li class="list-group-item user-select-none">None</li>'
                })
            } else console.warn('Invalid parameter received')
        }

        this.bindNormalListeners(listener)
        this.undoSelect.push(() => selected = '')
        object.refreshBtn.addEventListener('click', async (ev) => {
            listener(lastHost)
            ev.cancelBubble
        })
        this.refresh.push(() => object.refreshBtn.click())

        return object.card
    }

    protected createTimer() {
        let object = this.createItemListCard()
        let lastHost = ''
        let selected = ''

        let listener = (host: string) => {
            if (host.trim().length > 0) {
                lastHost = host
                ipcRenderer.invoke('core-get-timer-list:' + host).then(r => {
                    while (object.list.hasChildNodes()) object.list.removeChild(object.list.lastChild!)
                    Array.from(r).forEach(value => {
                        let li = document.createElement('li')
                        object.list.appendChild(li)
                        li.className = 'list-group-item list-group-item-action user-select-none'
                        li.setAttribute('data-bs-toggle', 'list')
                        li.setAttribute('role', 'tab')
                        li.textContent = String(value)
                        if (value === selected) li.classList.add('active')
                        li.addEventListener('click', async (ev) => {
                            this.undoSelect.forEach(value => value())
                            li.classList.add('active')
                            selected = String(value)
                            if (this.updateDetail && li.textContent) this.updateDetail('timer', String(value), lastHost)
                            ev.cancelBubble
                        })
                    })
                    if (!object.list.hasChildNodes()) object.list.innerHTML = '<li class="list-group-item user-select-none">None</li>'
                })
            } else console.warn('Invalid parameter received')
        }

        this.bindNormalListeners(listener)
        this.undoSelect.push(() => selected = '')
        object.refreshBtn.addEventListener('click', async (ev) => {
            listener(lastHost)
            ev.cancelBubble
        })
        this.refresh.push(() => object.refreshBtn.click())

        return object.card
    }
}

export {ListPage}