import {Page} from "./page/Page";

abstract class PageBuilder {
    abstract label: string
    abstract newPage: (() => Page)
    abstract hide: boolean
}

export {PageBuilder}