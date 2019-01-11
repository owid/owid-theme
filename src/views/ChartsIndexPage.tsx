import * as settings from '../settings'
import * as React from 'react'
import { Head } from './Head'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { CategoryWithEntries } from '../wpdb'
import * as _ from 'lodash'

export interface ChartIndexItem {
    title: string
    slug: string
}

export const ChartsIndexPage = (props: { entries: CategoryWithEntries[], chartItems: ChartIndexItem[] }) => {
    const { entries, chartItems } = props

    let sortedItems = _.sortBy(chartItems, c => c.title.trim())

    return <html>
        <Head canonicalUrl={`${settings.BAKED_URL}/charts`} pageTitle="Charts"/>
        <body className="ChartsIndexPage">
            <SiteHeader entries={entries} />
            <header className="chartsHeader">
                <input type="search" className="chartsSearchInput" placeholder="Search all interactive charts"/>
            </header>
            <main>
                <ul>
                    {sortedItems.map(chart => <li><a href={`/grapher/${chart.slug}`}>{chart.title}</a></li>)}
                </ul>
            </main>
            <SiteFooter/>
            <script>{`window.runChartsIndexPage()`}</script>
        </body>
    </html>
}