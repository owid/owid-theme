import * as settings from '../settings'
import * as React from 'react'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { formatContent, formatAuthors, formatDate } from '../formatting'
import { CategoryWithEntries } from '../wpdb'

export interface PostInfo {
    title: string
    content: string
    date: Date
    authors: string[]
}

export const BlogPostPage = (props: { entries: CategoryWithEntries[], page: PostInfo }) => {
    const {entries, page} = props
    const {footnotes, html} = formatContent(page.content)
    const authorsText = formatAuthors(page.authors)

    return <html>
        <head>
            <link rel="stylesheet" href={`${settings.STATIC_ROOT}/owid.css`}/>
        </head>
        <body className="single-post">
            <SiteHeader entries={entries}/>
            <main id="main" className="site-main">
                <header className="blog-header">
                    <h1>
                        <a href="/blog">Blog</a>
                    </h1>
                </header>
                <div className="site-content">
                    <article className="post">
                        <header className="article-header">
                            <h1 className="entry-title">{page.title}</h1>
                            <div className="entry-meta">
                                <time>{formatDate(page.date)}</time> by {formatAuthors(page.authors)}
                            </div>
                        </header>
                        <div className="article-content" dangerouslySetInnerHTML={{__html: html}}/>
                        <footer className="article-footer">
                            <h2 id="footnotes">Footnotes</h2>
                            <ol className="side-matter side-matter-list" style={{'list-style-type': 'decimal', opacity: 1}}>
                                {footnotes.map((footnote, i) =>
                                    <li id={`note-${i+1}`} className="side-matter side-matter-note" style={{'margin-top': '0px'}}>
                                        <div className="side-matter side-matter-text">
                                            <p dangerouslySetInnerHTML={{__html: footnote}}/>
                                        </div>
                                    </li>
                                )}
                            </ol>
                        </footer>
                    </article>
                </div>
            </main>
            <SiteFooter/>
        </body>
    </html>
}