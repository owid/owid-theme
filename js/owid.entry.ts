import '../css/style.scss'
import './oldScripts.js'
import {Analytics} from './Analytics'

const search = document.querySelector("form#search-nav")

if (search) {
    const input = search.querySelector("input[type=search]") as HTMLInputElement
    search.addEventListener('submit', () => Analytics.logEvent("OWID_SITE_SEARCH", { query: input.value }))
}