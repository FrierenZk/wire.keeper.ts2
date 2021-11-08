import {readLocal} from "../../common/resources";

class SearchLabel {
    public filter: ((_: string) => void) | null = null
    public removeFilter: (() => void) | null = null

    public create() {
        let fragment = document.createDocumentFragment()

        let search = document.createElement('div')
        search.className = 'd-flex flex-column border-bottom'
        fragment.appendChild(search)

        let searchLabel = document.createElement('div')
        search.appendChild(searchLabel)
        searchLabel.className = 'd-flex flex-row sidebar-search-label'
        searchLabel.innerHTML = `
            <svg width="1.25rem" height="1.25rem" fill="currentColor" class="bi bi-search me-2" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>`

        let searchInput = document.createElement('input')
        searchInput.className = 'form-control form-control-sm sidebar-search-input'
        searchInput.placeholder = readLocal('ui.sidebar.type.to.search')
        searchLabel.appendChild(searchInput)

        let searchBtn = document.createElement('button')
        searchBtn.className = 'sidebar-btn sidebar-search-btn'
        searchBtn.innerHTML = `
            <svg width="1rem" height="1rem" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
                <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>`
        searchLabel.appendChild(searchBtn)

        let filters = document.createElement('div')
        search.appendChild(filters)

        searchBtn.onclick = () => {
            if (searchInput.value.trim().length > 0) {
                while (filters.hasChildNodes()) filters.lastChild?.remove()
                let alert = document.createElement('div')
                alert.className = 'sidebar-search-filter'
                alert.innerHTML = `${readLocal('ui.sidebar.filter.html', searchInput.value.trim())}`
                let btn = document.createElement('button')
                alert.appendChild(btn)
                btn.type = 'button'
                btn.className = 'btn-close'
                btn.style.width = '0.25rem'
                btn.style.height = '0.25rem'
                btn.style.marginLeft = '0.5rem'
                btn.setAttribute('data-bs-dismiss', 'alert')
                btn.setAttribute('aria-label', 'Close')
                btn.onclick = () => {
                    if (this.removeFilter) this.removeFilter()
                    setImmediate(() => alert.remove())
                }
                filters.appendChild(alert)
                if (this.filter) this.filter(searchInput.value.trim())
            }
        }

        return fragment
    }
}

export {SearchLabel}