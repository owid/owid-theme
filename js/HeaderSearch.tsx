import * as React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import * as algoliasearch from 'algoliasearch'

interface PostHit {
    slug: string
    title: string
    content: string
    _highlightResult: any
}

class SearchResult extends React.Component<{ hit: PostHit }> {
    render() {
        const {hit} = this.props
        console.log(hit)
        return <div className="SearchResult">
            <a href={hit.slug} dangerouslySetInnerHTML={{__html: hit._highlightResult.title.value}}/>
            <p dangerouslySetInnerHTML={{__html: hit._highlightResult.content.value}}/>
        </div>
    }
}

class SearchResults extends React.Component<{ hits: PostHit[] }> {
    componentDidMount() {
        document.body.style.overflowY = 'hidden'
    }

    componentWillUnmount() {
        document.body.style.overflowY = null
    }

    render() {
        const {hits} = this.props
        return <div className="SearchResults">
            {hits.map(hit => <SearchResult hit={hit}/>)}
        </div>
    }
}

@observer
export class HeaderSearch extends React.Component {
    @observable.ref hits?: PostHit[]

    async onSearch(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.currentTarget.value
        const algolia = algoliasearch("TBPYZP1AP6", "2078ca669653f7f0e5aac70e4f7c7eb1")
        const json = await algolia.search([{ indexName: 'mispydev_owid_articles', query: value, params: { distinct: true } }])
        this.hits = json.results[0].hits
        console.log(this.hits[0])
    }

    render() {
        const {hits} = this
        return <form id="search-nav">
            <input type="search" onChange={e => this.onSearch(e)}/>
            {hits && <SearchResults hits={hits}/>}
        </form>
    }
}