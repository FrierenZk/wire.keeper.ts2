interface IToast {
    toast: HTMLElement

    create(): DocumentFragment

    show(): void
}

export {IToast}