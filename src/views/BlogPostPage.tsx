import * as settings from '../settings'
import * as React from 'react'
import { Head } from './Head'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { formatContent, formatAuthors, formatDate } from '../formatting'
import { CategoryWithEntries, FullPost } from '../wpdb'

export const BlogPostPage = (props: { entries: CategoryWithEntries[], post: FullPost }) => {
    const {entries, post} = props
    const {footnotes, excerpt, html} = formatContent(post.content)
    const authorsText = formatAuthors(post.authors)

    const pageTitle = post.title
    const canonicalUrl = `${settings.BAKED_URL}/${post.slug}`
    const pageDesc = post.excerpt || excerpt

    return <html>
        <Head pageTitle={pageTitle} pageDesc={pageDesc} canonicalUrl={canonicalUrl} imageUrl={post.imageUrl}/>
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
                            <h1 className="entry-title">{post.title}</h1>
                            <div className="entry-meta">
                                <time>{formatDate(post.date)}</time> by {formatAuthors(post.authors)}
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