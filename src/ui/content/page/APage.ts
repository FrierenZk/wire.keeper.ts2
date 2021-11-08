import {AListener} from "./AListener";
import {Page} from "./Page";

abstract class APage extends AListener implements Page {
    protected cleanList: Array<HTMLElement> = []

    abstract preSet(args: any): void

    abstract create(): Promise<DocumentFragment>

    remove(): void {
        this.cleanList.forEach(value => value.remove())
        this.removeRendererListeners()
    }
}

export {APage}