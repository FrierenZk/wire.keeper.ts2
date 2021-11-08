interface Page {
    preSet(para: any): void

    create(): Promise<DocumentFragment>

    remove(): void
}

export {Page}