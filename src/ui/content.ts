export class Content {
    static createFragment() {
        let fragment = document.createDocumentFragment()

        let tabSet = new TabSet()
        fragment.appendChild(tabSet.create())

        return fragment
    }
}

class TabSet {
    public create() {
        let fragment = document.createDocumentFragment()

        let tabSet = document.createElement('div')
        tabSet.className = 'content-tab-set'
        fragment.appendChild(tabSet)

        return fragment
    }
}