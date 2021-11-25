interface IModal {
    modal: HTMLElement

    create(): DocumentFragment

    show(): void
}

export {IModal}