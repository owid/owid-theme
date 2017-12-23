import * as settings from '../settings'
import * as React from 'react'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { CategoryWithEntries } from '../wpdb'
import { formatAuthors, formatDate } from '../formatting'

interface PostMeta {
    title: string
    slug: string
    date: Date
    authors: string[]
}

export const BlogIndexPage = (props: { entries: CategoryWithEntries[], posts: PostMeta[] }) => {
    const {entries, posts} = props
    return <html>
        <head>
            <link rel="stylesheet" href={`${settings.STATIC_ROOT}/owid.css`} />
        </head>
        <body>
            <SiteHeader entries={entries} />

            <main id="main" className="site-main">
                <div className="site-content">
                    <h2>Latest Posts</h2>
                    <ul className="posts">
                        {posts.map(post => 
                            <li className="post">
                                <a href={`/${post.slug}`}>
                                    {/*thumbnail*/}
                                    <h3>{post.title}</h3>
                                    <div className="entry-meta">
                                        <time>{formatDate(post.date)}</time> by {formatAuthors(post.authors)}
                                    </div>
                                </a>
                            </li>
                        )}
                	</ul>
                    {/* pagination */}
                </div>
            </main>
            <SiteFooter/>
        </body>        
    </html>
}