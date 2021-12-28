import bootstrap = require("bootstrap");

class Tooltip {
    static set(el: HTMLElement, text: string) {
        el.setAttribute('data-bs-toggle', 'tooltip')
        el.setAttribute('title', text)
        return new bootstrap.Tooltip(el)
    }

    static setTop(el: HTMLElement, text: string) {
        el.setAttribute('data-bs-toggle', 'tooltip')
        el.setAttribute('title', text)
        el.setAttribute('data-bs-placement', 'top')
        return new bootstrap.Tooltip(el)
    }

    static setBottom(el: HTMLElement, text: string) {
        el.setAttribute('data-bs-toggle', 'tooltip')
        el.setAttribute('title', text)
        el.setAttribute('data-bs-placement', 'bottom')
        return new bootstrap.Tooltip(el)
    }

    static setLeft(el: HTMLElement, text: string) {
        el.setAttribute('data-bs-toggle', 'tooltip')
        el.setAttribute('title', text)
        el.setAttribute('data-bs-placement', 'left')
        return new bootstrap.Tooltip(el)
    }

    static setRight(el: HTMLElement, text: string) {
        el.setAttribute('data-bs-toggle', 'tooltip')
        el.setAttribute('title', text)
        el.setAttribute('data-bs-placement', 'right')
        return new bootstrap.Tooltip(el)
    }
}

export {Tooltip}