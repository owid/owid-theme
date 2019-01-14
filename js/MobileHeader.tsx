import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'

export interface EntryMeta {
    slug: string
    title: string
    starred: boolean
}

export interface CategoryWithEntries {
    name: string
    slug: string
    entries: EntryMeta[]
}



@observer
export class MobileEntriesMenu extends React.Component {
    @observable categories: CategoryWithEntries[] = []

    async getEntries() {
        const json = await (await fetch("/entries.json", {
            method: "GET",
            credentials: 'same-origin',
            headers: {
                "Accept": "application/json"
            }
        })).json()
        console.log(json)
        runInAction(() => this.categories = json.categories)
    }

    componentDidMount() {
        this.getEntries()
    }

    render() {
        const {categories} = this
        return <ul>
            <li className="header">
                <h2>Entries</h2>
            </li>
            {categories.map(category =>
                <li key={category.slug} className="category">
                    <a href={`/#${category.slug}`}><span>{category.name}</span></a>
                    <div className="subcategory-menu">
                        <div className="submenu-title">{category.name}</div>
                        <ul>
                            {category.entries.map(entry => {
                                return <li key={entry.slug}>
                                    <a className={entry.starred ? "starred" : undefined} title={entry.starred ? "Starred pages are our best and most complete entries." : undefined} href={`/${entry.slug}`}>{entry.title}</a>
                                </li>
                            })}
                        </ul>
                    </div>
                </li>
            )}
            <li className="end-link"><a href="/charts">Charts</a></li>
            <li className="end-link"><a href="https://sdg-tracker.org">SDGs</a></li>
            <li className="end-link"><a href="/blog">Blog</a></li>
            <li className='end-link'><a href='/about'>About</a></li>
            <li className='end-link'><a href='/teaching'>Teaching</a></li>
            <li className='end-link'><a href='/support'>Donate</a></li>
        </ul>
    }
}

export function runMobileEntriesMenu() {
    ReactDOM.render(<MobileEntriesMenu/>, document.querySelector("#topics-dropdown"))
}

export class MobileSearchMenu extends React.Component {
    render() {
        return <div id="search-dropdown" className="mobile">
            <form id="search-nav" action="https://google.com/search" method="GET">
                <input type="hidden" name="sitesearch" value="ourworldindata.org" />
                <input type="search" name="q" placeholder="Search..." />
            </form>
        </div>
    }
}

