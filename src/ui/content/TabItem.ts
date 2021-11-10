import {Page} from "./page/Page";

class TabItem {
    public onClick: (() => void) | null = null
    public onRemove: (() => void) | null = null
    public remove: (() => void) | null = null
    public page: Page | null = null
    protected tab = document.createElement('div')

    public create(title: string) {
        this.tab.className = 'content-tab-item'
        this.tab.setAttribute('custom-active', 'false')
        this.tab.onclick = () => {
            this.tab.setAttribute('custom-active', 'true')
            if (this.onClick) this.onClick()
        }
        this.tab.textContent = title
        let xBtn = document.createElement('div')
        this.tab.appendChild(xBtn)
        xBtn.className = 'content-tab-item-x'
        xBtn.innerHTML = `
            <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`
        xBtn.addEventListener('click', (e) => {
            e.cancelBubble = true
            this.tab.remove()
            if (this.onRemove) this.onRemove()
        })
        this.remove = () => xBtn.click()
        return this.tab
    }

    public active() {
        this.tab.click()
    }

    public deactivate() {
        this.tab.setAttribute('custom-active', 'false')
    }
}

export {TabItem}