import {readLocal} from "../common/resources";

export class Sidebar {
    static createFragment() {
        let fragment = document.createDocumentFragment()


        let header = document.createElement('h6')
        header.className = 'sidebar-heading border-bottom'
        header.textContent = 'Main'
        fragment.appendChild(header)


        let buttons = document.createElement('div')
        buttons.className = 'sidebar-btn-group border-bottom'
        fragment.appendChild(buttons)

        let refreshBtn = document.createElement('button')
        refreshBtn.title = readLocal('ui.sidebar.refresh')
        refreshBtn.innerHTML = `<svg width="16" height="16" fill="currentColor" class="bi bi-bootstrap-reboot" viewBox="0 0 16 16">
                                    <path d="M1.161 8a6.84 6.84 0 1 0 6.842-6.84.58.58 0 1 1 0-1.16 8 8 0 1 1-6.556 3.412l-.663-.577a.58.58 0 0 1 .227-.997l2.52-.69a.58.58 0 0 1 .728.633l-.332 2.592a.58.58 0 0 1-.956.364l-.643-.56A6.812 6.812 0 0 0 1.16 8z"/>
                                    <path d="M6.641 11.671V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352h1.141zm0-3.75V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324h-1.6z"/>
                                </svg>`
        buttons.appendChild(refreshBtn)

        let splitter = document.createElement('div')
        splitter.className = 'splitter'
        buttons.appendChild(splitter)

        let addBtn = document.createElement('button')
        addBtn.title = readLocal('ui.sidebar.add')
        addBtn.innerHTML = `<svg width="1rem" height="1rem" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                            </svg>`
        buttons.appendChild(addBtn)

        let xBtn = document.createElement('button')
        xBtn.title = readLocal('ui.sidebar.delete')
        xBtn.innerHTML = `<svg width="1rem" height="1rem" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                          </svg>`
        buttons.appendChild(xBtn)

        ;[refreshBtn, addBtn, xBtn].forEach(value => {
            value.className = 'sidebar-btn'
            value.setAttribute('data-bs-toggle', 'tooltip')
            value.setAttribute('data-bs-placement', 'top')
        })


        let search = document.createElement('div')
        search.className = 'd-flex flex-column border-bottom'
        fragment.appendChild(search)

        let searchLabel = document.createElement('div')
        search.appendChild(searchLabel)
        searchLabel.className = 'd-flex flex-row sidebar-search-label'
        searchLabel.innerHTML = `<svg width="1.25rem" height="1.25rem" fill="currentColor" class="bi bi-search me-2" viewBox="0 0 16 16">
                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                                 </svg>`

        let searchInput = document.createElement('input')
        searchInput.className = 'form-control form-control-sm sidebar-search-input'
        searchInput.placeholder = readLocal('ui.sidebar.type.to.search')
        searchLabel.appendChild(searchInput)

        let searchBtn = document.createElement('button')
        searchBtn.className = 'sidebar-btn sidebar-search-btn'
        searchBtn.innerHTML = `<svg width="1rem" height="1rem" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
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
                    //TODO remove list filter
                    setImmediate(() => alert.remove())
                }
                filters.appendChild(alert)
                //TODO filter out target in whole list
            }
        }


        return fragment
    }
}