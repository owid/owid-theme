import * as React from 'react'
import { CategoryWithEntries, EntryMeta } from '../wpdb'
import * as _ from 'lodash'
import { faSearch, faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// XXX this menu is pretty old and should be redone at some stage

export const SiteHeader = (props: { entries: CategoryWithEntries[], activeSlug?: string }) => {
    const {entries} = props

    const activeCategories: CategoryWithEntries[] = []
    let activeEntry: EntryMeta|undefined = undefined
    for (const category of entries) {
        for (const entry of category.entries) {
            if (entry.slug === props.activeSlug) {
                activeCategories.push(category)
                if (!activeEntry) activeEntry = entry
            }
        }
    }
    const mainCategory = activeCategories[0]

    return <header className="SiteHeader">
        <nav id="owid-topbar">
            <a className="logo" href="/">Our World in Data</a>
            <ul className="desktop">
                <li>
                    <form id="search-nav" action="https://google.com/search" method="GET">
                        <input type="hidden" name="sitesearch" value="ourworldindata.org" />
                        <input type="search" name="q" placeholder="Search..." />
                    </form>
                </li>
                <li><a href="/charts">Charts</a></li>
                <li><a href="https://sdg-tracker.org" title="Sustainable Development Goals">SDGs</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/teaching">Teaching</a></li>
                <li><a href="/support">Donate</a></li>
            </ul>
            <ul className="mobile">
                <li className="nav-button">
                    <a href="https://google.com/search?q=site:ourworldindata.org" data-expand="#search-dropdown"><FontAwesomeIcon icon={faSearch}/></a>
                </li><li className="nav-button">
                    <a href="/" data-expand="#topics-dropdown" className='mobile'><FontAwesomeIcon icon={faBars}/></a>
                </li>
            </ul>
        </nav>
        <div id="topics-dropdown" className="mobile"></div>
        <div id="search-dropdown" className="mobile">
            <form id="search-nav" action="https://google.com/search" method="GET">
                <input type="hidden" name="sitesearch" value="ourworldindata.org" />
                <input type="search" name="q" placeholder="Search..." />
            </form>
        </div>
        <div id="category-nav" className="desktop">
            <ul>
                {entries.map(category =>
                    <li key={category.slug} className={`category` + (_.includes(activeCategories, category) ? " active" : "")} title={category.name}>
                        <a href={`/#${category.slug}`}><span>{category.name}</span></a>
                        <ul className="entries">
                            <li><hr/></li>
                            {category.entries.map(entry =>
                                <li key={entry.slug}><a className={entry.starred ? "starred" : undefined} title={entry.starred ? "Starred pages are our best and most complete entries." : undefined} href={`/${entry.slug}`}>{entry.title}</a></li>
                            )}
                        </ul>
                    </li>
                )}
            </ul>
            </div>
            <div id="entries-nav" className="desktop">
                {mainCategory && [
                    <li key={0}><hr/></li>,
                    mainCategory.entries.map(entry => {
                        const classes = []
                        return <li key={entry.slug} className={entry === activeEntry ? "active" : undefined}>
                            <a className={entry.starred ? "starred" : undefined} title={entry.starred ? "Starred pages are our best and most complete entries." : undefined} href={`/${entry.slug}`}>{entry.title}</a>
                        </li>
                    })
                ]}
            </div>
        </header>

}
