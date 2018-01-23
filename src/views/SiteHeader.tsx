import * as React from 'react'
import { CategoryWithEntries } from '../wpdb'

export const SiteHeader = (props: { entries: CategoryWithEntries[] }) => {
    const {entries} = props
    return <header className="SiteHeader">
        <nav id="owid-topbar">
            <ul className="desktop right">
                <li>
                    <form id="search-nav" action="https://google.com/search" method="GET">
                        <input type="hidden" name="sitesearch" value="ourworldindata.org" />
                        <input type="search" name="q" placeholder="Search..." />
                        <button type="submit">
                            <i className="fa fa-search"></i>
                        </button>
                    </form>
                </li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/support">Donate</a></li>
            </ul>
            <h1 id="owid-title">
                <a href="/"><span>Our World in Data</span></a>
            </h1>
            <ul className="mobile right">
                <li className="nav-button">
                    <a href="/search" data-expand="#search-dropdown"><i className='fa fa-search'></i></a>
                </li><li className="nav-button">
                    <a href="/data" data-expand="#topics-dropdown" className='mobile'><i className='fa fa-bars'></i></a>
                </li>
            </ul>
        </nav>
        <div id="topics-dropdown" className="mobile">
            <ul>
                <li className="header">
                    <h2>Entries</h2>
                </li>
                {entries.map(category =>
                    <li className="category">
                        <a href={`/#${category.slug}`}><span>{category.name}</span></a>
                        <div className="subcategory-menu">
                            <div className="submenu-title">{category.name}</div>
                            <ul>
                                {category.entries.map(entry =>
                                    <li><a className={entry.starred ? "starred" : undefined} href={`/${entry.slug}`}>{entry.title}</a></li>
                                )}
                            </ul>
                        </div>
                    </li>
                )}
                <li className='end-link'><a href='/about'>About</a></li>
                <li className='end-link'><a href='/support'>Donate</a></li>
                <li className='end-link'><a href='/data'>Browse All</a></li>
            </ul>
        </div>
        <div id="search-dropdown" className="mobile">
            <form id="search-nav" action="https://google.com/search" method="GET">
                <input type="hidden" name="sitesearch" value="ourworldindata.org" />
                <input type="search" name="q" placeholder="Search..." />
                <button type="submit">
                    <i className="fa fa-search"></i>
                </button>
            </form>
        </div>
        <div id="category-nav" className="desktop">
            <ul>
                {entries.map(category => 
                    <li className="category" title={category.name}>
                        <a href={`/#${category.slug}`}><span>{category.name}</span></a>
                        <ul className="entries">
                            <li><hr/></li>
                            {category.entries.map(entry =>
                                <li><a className={entry.starred ? "starred" : undefined} href={`/${entry.slug}`}>{entry.title}</a></li>
                            )}
                        </ul>
                    </li>
                )}
            </ul>
            </div>
            <div id="entries-nav" className="desktop">
            </div>
        </header>

}