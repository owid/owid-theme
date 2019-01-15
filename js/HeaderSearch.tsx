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
interface ChartHit {
    slug: string
    title: string
    _highlightResult: any
}
interface Results {
    posts: PostHit[]
    charts: ChartHit[]
}
class PostResult extends React.Component<{ hit: PostHit }> {
    render() {
        const {hit} = this.props
        return <div className="PostResult">
            <a href={`/${hit.slug}`} dangerouslySetInnerHTML={{__html: hit._highlightResult.title.value}}/>
            <p dangerouslySetInnerHTML={{__html: hit._highlightResult.content.value}}/>
        </div>
    }
}
class ChartResult extends React.Component<{ hit: ChartHit }> {
    render() {
        const {hit} = this.props
        return <div className="ChartResult">
            <a href={`/grapher/${hit.slug}`} dangerouslySetInnerHTML={{__html: hit._highlightResult.title.value}}/>
        </div>
    }
}


class SearchResults extends React.Component<{ results: Results }> {
    componentDidMount() {
        document.body.style.overflowY = 'hidden'
        this.componentDidUpdate()
    }

    componentDidUpdate() {
        (window as any).Grapher.embedAll()
    }

    componentWillUnmount() {
        document.body.style.overflowY = null
    }

    render() {
        const {results} = this.props
        return <div className="SearchResults">
            {/* {results.posts.map(hit => <PostResult key={hit.slug} hit={hit}/>)} */}
            {!!results.charts.length && <figure data-grapher-src={`https://ourworldindata.org/grapher/${results.charts[0].slug}`}/>}
            {results.charts.map(hit => <ChartResult key={hit.slug} hit={hit}/>)}
        </div>
    }
}
@observer
export class HeaderSearch extends React.Component {
    @observable.ref results?: Results

    async onSearch(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.currentTarget.value
        if (value) {
            const algolia = algoliasearch("TBPYZP1AP6", "2078ca669653f7f0e5aac70e4f7c7eb1")
            const json = await algolia.search([
                { indexName: 'mispydev_owid_articles', query: value, params: { distinct: true } },
                { indexName: 'mispydev_owid_charts', query: value, params: {} }
            ])
            this.results = {
                posts: json.results[0].hits,
                charts: json.results[1].hits
            }
            console.log(this.results)
        } else {
            this.results = undefined
        }
    }

    render() {
        const {results} = this
        return <form id="search-nav">
            <input type="search" onChange={e => this.onSearch(e)} autoFocus/>
            {results && <SearchResults results={results}/>}
        </form>
    }
}