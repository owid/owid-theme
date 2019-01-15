import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { observable, runInAction, action } from 'mobx'
import { observer } from 'mobx-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faBars } from '@fortawesome/free-solid-svg-icons'

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
export class DesktopTopicsMenu extends React.Component<{ categories: CategoryWithEntries[] }> {
    @observable.ref activeCategory?: CategoryWithEntries

    @action.bound setCategory(category: CategoryWithEntries) {
        this.activeCategory = category
    }

    render() {
        const { activeCategory } = this
        const { categories } = this.props

        return <div className="topics-dropdown">
            {categories.map((category) => <React.Fragment key={category.name}>
                <div className="category">{category.name}</div>
                <div className="entries">
                    {category.entries.map((entry) => <div key={entry.title} className="entry">{entry.title}</div>)}
                </div>
            </React.Fragment>)}
        </div>
    }
}

class CategoryItem extends React.Component<{ category: CategoryWithEntries, active: Boolean, onAimOver: Function }> {
    render() {
        const { category, active, onAimOver } = this.props
        return <div className={active ? "active item" : "item"} onMouseEnter={(event) => onAimOver(event)}>
            {category.name}
        </div>
    }
}

@observer
export class DesktopHeader extends React.Component<{ categories: CategoryWithEntries[] }> {
    @observable.ref activeCategory?: CategoryWithEntries

    @action.bound setCategory(category: CategoryWithEntries) {
        this.activeCategory = category
    }

    render() {
        const {activeCategory} = this
        const {categories} = this.props

        return <React.Fragment>
            <div className="large-buttons">
                <button className="topics-button active">
                    <div className="label">
                        Research <br /><strong>by topic</strong>
                    </div>
                    <div className="icon">
                        <svg width="12" height="6" viewBox="0 0 12 6"><path d="M0,0 L12,0 L6,6 Z" fill="currentColor" /></svg>
                    </div>
                    <DesktopTopicsMenu categories={categories} />
                </button>
            </div>
            <div>
                <div className="site-primary-navigation">
                    <div className="site-search">
                        <input type="search" placeholder="Search..." />
                        <div className="search-icon">
                            <FontAwesomeIcon icon={faSearch} />
                        </div>
                    </div>
                    <ul className="site-primary-links">
                        <li><a href="/blog">Blog</a></li>
                        <li><a href="/about">About</a></li>
                        <li><a href="/support">Donate</a></li>
                    </ul>
                </div>
                <div className="site-secondary-navigation">
                    <ul className="site-secondary-links">
                        <li><a href="/charts">All charts and research</a></li>
                        <li><a href="/teaching">Teaching material</a></li>
                        <li><a href="https://sdg-tracker.org">Sustainable Development Goals</a></li>
                    </ul>
                </div>
            </div>
        </React.Fragment>
    }
}

@observer
export class SiteHeaderMenus extends React.Component<{ categories: CategoryWithEntries[] }> {
    @observable width!: number

    @action.bound onResize() {
        this.width = window.innerWidth
    }

    componentDidMount() {
        this.onResize()
        window.addEventListener('resize', this.onResize)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize)
    }

    render() {
        // return this.width > 1060 ? <DesktopHeader categories={this.props.categories}/> : <MobileHeader categories={this.props.categories}/>
        return <DesktopHeader categories={this.props.categories}/>
    }
}

export class HeaderMenus {
    async run() {
        const json = await (await fetch("/headerMenu.json", {
            method: "GET",
            credentials: 'same-origin',
            headers: {
                "Accept": "application/json"
            }
        })).json()

        ReactDOM.render(<SiteHeaderMenus categories={json.categories}/>, document.querySelector(".site-navigation"))
    }
}

export function runHeaderMenus() {
    const header = new HeaderMenus()
    header.run()
}


