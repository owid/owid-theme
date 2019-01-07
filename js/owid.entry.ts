import '../css/style.scss'
import './oldScripts.js'
import {Analytics} from './Analytics'

Analytics.logEvent("OWID_PAGE_LOAD")

const search = document.querySelector("form#search-nav") as HTMLFormElement
if (search) {
    const input = search.querySelector("input[type=search]") as HTMLInputElement
    let lastQuery = ""
    search.addEventListener('submit', (ev) => {
        ev.preventDefault()
        Analytics.logEvent("OWID_SITE_SEARCH", { query: input.value, href: window.location.href }).then(() => search.submit()).catch(() => search.submit())
    })
}