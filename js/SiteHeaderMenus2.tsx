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
            <div className="menu">
                {categories.map((category) => <CategoryItem category={category} active={category === activeCategory} onAimOver={() => this.setCategory(category)} />)}
            </div>
            <div className="submenu">
                {
                    !activeCategory
                    ? <div className="instructions">Select a category on the left</div>
                    : activeCategory.entries.map((entry) => <a  href={`/${entry.slug}`} className="item">{entry.title}</a>)
                }
            </div>
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

// @observer
// export class MobileEntriesMenu extends React.Component<{ categories: CategoryWithEntries[] }> {
//     @observable.ref activeCategory?: CategoryWithEntries

//     @action.bound toggleCategory(category: CategoryWithEntries) {
//         if (this.activeCategory === category)
//             this.activeCategory = undefined
//         else
//             this.activeCategory = category
//     }

//     render() {
//         const {categories} = this.props
//         const {activeCategory} = this

//         return <div id="topics-dropdown" className="mobile">
//             <ul>
//                 <li className="header">
//                     <h2>Entries</h2>
//                 </li>
//                 {categories.map(category =>
//                     <li key={category.slug} className="category">
//                         <a onClick={() => this.toggleCategory(category)}><span>{category.name}</span></a>
//                         {activeCategory === category && <div className="subcategory-menu">
//                             <ul>
//                                 {category.entries.map(entry => {
//                                     return <li key={entry.slug}>
//                                         <a className={entry.starred ? "starred" : undefined} title={entry.starred ? "Starred pages are our best and most complete entries." : undefined} href={`/${entry.slug}`}>{entry.title}</a>
//                                     </li>
//                                 })}
//                             </ul>
//                         </div>}
//                     </li>
//                 )}
//                 <li className="end-link"><a href="/charts">Charts</a></li>
//                 <li className="end-link"><a href="https://sdg-tracker.org">SDGs</a></li>
//                 <li className="end-link"><a href="/blog">Blog</a></li>
//                 <li className='end-link'><a href='/about'>About</a></li>
//                 <li className='end-link'><a href='/teaching'>Teaching</a></li>
//                 <li className='end-link'><a href='/support'>Donate</a></li>
//             </ul>
//         </div>
//     }
// }

// @observer
// export class MobileHeader extends React.Component<{ categories: CategoryWithEntries[] }> {
//     @observable showSearch: boolean = false
//     @observable showCategories: boolean = false

//     @action.bound onToggleSearch() {
//         this.showSearch = !this.showSearch
//     }

//     @action.bound onToggleCategories() {
//         this.showCategories = !this.showCategories
//     }

//     render() {
//         return <React.Fragment>
//             <nav id="owid-topbar">
//                 <a className="logo" href="/">Our World in Data</a>
//                 <ul className="mobile">
//                     <li className="nav-button">
//                         <a onClick={this.onToggleSearch}><FontAwesomeIcon icon={faSearch}/></a>
//                     </li><li className="nav-button">
//                         <a onClick={this.onToggleCategories} data-expand="#topics-dropdown" className='mobile'><FontAwesomeIcon icon={faBars}/></a>
//                     </li>
//                 </ul>
//             </nav>
//             {this.showSearch && <div id="search-dropdown" className="mobile">
//                 <form id="search-nav" action="https://google.com/search" method="GET">
//                     <input type="hidden" name="sitesearch" value="ourworldindata.org" />
//                     <input type="search" name="q" placeholder="Search..." autoFocus/>
//                 </form>
//             </div>}
//             {this.showCategories && <MobileEntriesMenu categories={this.props.categories}/>}
//         </React.Fragment>
//     }
// }

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


