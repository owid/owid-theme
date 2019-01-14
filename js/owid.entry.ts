import '../css/style.scss'
import './oldScripts.js'
import {Analytics} from './Analytics'
import {runChartsIndexPage} from './runChartsIndexPage'
import {runHeaderMenus} from './SiteHeaderMenus'

Analytics.logEvent("OWID_PAGE_LOAD")

const search = document.querySelector("form#search-nav") as HTMLFormElement
if (search) {
    const input = search.querySelector("input[type=search]") as HTMLInputElement
    let lastQuery = ""
    search.addEventListener('submit', (ev) => {
        ev.preventDefault()
        Analytics.logEvent("OWID_SITE_SEARCH", { query: input.value }).then(() => search.submit()).catch(() => search.submit())
    })
}

function getParent(el: HTMLElement, condition: Function): HTMLElement | null {
    let current: HTMLElement | null = el
    while (current) {
        if (condition(current)) return current
        current = current.parentElement
    }
    return null
}

const trackedLinkExists: boolean = !!document.querySelector("a[data-track-click]")

if (trackedLinkExists) {
    document.addEventListener("click", (ev) => {
        const targetElement = ev.target as HTMLElement
        const trackedElement = getParent(targetElement, (el: HTMLElement) => el.getAttribute("data-track-click") != null)
        if (trackedElement) {
            // Note this will not work on anchor tags without target=_blank, as
            // they immediately navigate away before the event can be sent.
            // To handle those we need to wait before navigating.
            Analytics.logEvent("OWID_SITE_CLICK", {
                text: trackedElement.innerText,
                href: trackedElement.getAttribute("href")
            })
        }
    })
}

declare var window: any

window.runChartsIndexPage = runChartsIndexPage
window.runHeaderMenus = runHeaderMenus
runHeaderMenus()