import {APage} from "./APage";
import {readLocal} from "../../../common/resources";
import {HeaderCard} from "./HeaderCard";
import {HostSelectionCard} from "./HostSelectionCard";

class TimerPage extends APage {
    protected mode: string = ''
    protected host: string = ''

    preSet(args: any): void {
        try {
            //TODO: parse args
        } catch (e) {
            console.error(e)
        }
    }

    async create() {
        let fragment = document.createDocumentFragment()

        fragment.appendChild(this.createHeader())
        fragment.appendChild(this.createBody())

        return fragment
    }

    protected createHeader() {
        let title: string
        let button = document.createElement('button')
        button.type = 'button'
        button.className = 'btn btn-sm btn-primary mx-2'
        button.textContent = readLocal('ui.content.page.timer.save')
        switch (this.mode) {
            case 'edit':
                title = readLocal('ui.content.page.timer.title.edit')
                button.addEventListener('click', ev => {
                    ev.cancelBubble
                    //TODO: save timer config
                })
                break
            default:
                title = readLocal('ui.content.page.timer.title.create')
                button.addEventListener('click', ev => {
                    ev.cancelBubble
                    //TODO: create new timer
                })
                break
        }
        return new HeaderCard().create(title, button)
    }

    protected createBody() {
        let body = document.createElement('div')
        body.className = 'd-flex flex-row'

        let left = document.createElement('div')
        body.appendChild(left)
        left.className = 'd-flex flex-column'

        let hostCard = new HostSelectionCard()
        hostCard.bindListener(async (host: string) => {
            this.normalListeners.forEach(value => value(host))
        })
        left.appendChild(hostCard.create(null))

        left.appendChild(this.createBaseCard())

        let right = document.createElement('div')
        body.appendChild(right)
        right.className = 'd-flex flex-column col'
        right.appendChild(this.createBuildCard())
        right.appendChild(this.createExtraCard())

        return body
    }

    protected createBaseCard() {
        // TODO: create card
        return document.createElement('div')
    }

    protected createExtraCard() {
        // TODO: create card
        return document.createElement('div')
    }

    protected createBuildCard() {
        // TODO: create card
        return document.createElement('div')
    }
}

export {TimerPage}