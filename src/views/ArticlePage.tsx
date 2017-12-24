import * as settings from '../settings'
import * as React from 'react'
import { Head } from './Head'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { formatAuthors, FormattedPost } from '../formatting'
import { CategoryWithEntries } from '../wpdb'
const urlSlug = require('url-slug')

export const ArticlePage = (props: { entries: CategoryWithEntries[], post: FormattedPost }) => {
    const {entries, post} = props
    const authorsText = formatAuthors(post.authors)

    const pageTitle = post.title
    const canonicalUrl = `${settings.BAKED_URL}/${post.slug}`
    const pageDesc = post.excerpt

    return <html>
        <Head pageTitle={pageTitle} pageDesc={pageDesc} canonicalUrl={canonicalUrl} imageUrl={post.imageUrl}/>
        <body>
            <SiteHeader entries={entries}/>
            <main>
                <div className={"clearfix" + (post.tocHeadings.length > 0 ? " page-with-sidebar" : "")}>
                    {post.tocHeadings.length > 0 && <div className="entry-sidebar">
                        <nav className="entry-toc">
                            <h3>Contents</h3>
                            <ol>
                                {post.tocHeadings.map(heading => 
                                    <li className={heading.isSubheading ? "subsection" : "section"}>
                                        <a href={`#${heading.slug}`}>{heading.text}</a>
                                    </li>
                                )}
                            </ol>
                        </nav>
                    </div>}
                    <article className="page">
                        <header className="article-header">
                            <h1 className="entry-title">{post.title}</h1>
                            <div className="authors-byline">
                                <a href="/about/#the-team">by {authorsText}</a>
                            </div>
                        </header>
                        <div className="article-content" dangerouslySetInnerHTML={{__html: post.html}}/>
                        {post.footnotes.length > 0 && <footer className="article-footer">
                            <h2 id="footnotes">Footnotes</h2>
                            <ol className="side-matter side-matter-list" style={{'list-style-type': 'decimal', opacity: 1}}>
                                {post.footnotes.map((footnote, i) =>
                                    <li id={`note-${i+1}`} className="side-matter side-matter-note" style={{'margin-top': '0px'}}>
                                        <div className="side-matter side-matter-text">
                                            <p dangerouslySetInnerHTML={{__html: footnote}}/>
                                        </div>
                                    </li>
                                )}
                            </ol>
                        </footer>}
                    </article>
                </div>
            </main>
            <SiteFooter/>
        </body>
    </html>
}