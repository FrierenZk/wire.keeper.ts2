class HeaderCard {
    create(title: string, button: HTMLElement | null) {
        let fragment = document.createDocumentFragment()

        let card = document.createElement('div')
        fragment.appendChild(card)
        card.className = 'content-page-card'

        let body = document.createElement('div')
        card.appendChild(body)
        body.className = 'card-body flex-row align-items-center'
        body.innerHTML = `<h4 class="ms-2 me-auto user-select-none mb-0">${title}</h4>`

        if (button) {
            body.appendChild(button)
        }

        return fragment
    }
}

export {HeaderCard}