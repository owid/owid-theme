import * as React from 'react'
import { CategoryWithEntries } from '../wpdb'

export const SiteHeader = (props: { entries: CategoryWithEntries[] }) => {
    return <header className="SiteHeader">
        <div className="container">
            <a className="logo" href="/">Our World in Data</a>
            <nav>
                <a href="/blog">Blog</a>
                <a href="/about">About</a>
                <a href="/support">Donate</a>
            </nav>
        </div>
    </header>

}