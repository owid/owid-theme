import {BAKED_URL, WORDPRESS_URL} from '../settings'
import * as React from 'react'
import { Head } from './Head'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { formatAuthors, FormattedPost } from '../formatting'
import { CategoryWithEntries } from '../wpdb'
const urlSlug = require('url-slug')

export const ArticlePage = (props: { entries: CategoryWithEntries[], post: FormattedPost }) => {
    const {entries, post} = props
    const authorsText = formatAuthors(post.authors, true)

    const pageTitle = post.title
    const canonicalUrl = `${BAKED_URL}/${post.slug}`
    const pageDesc = post.excerpt
    const publishedYear = post.modifiedDate.getFullYear()

    return <html>
        <Head pageTitle={pageTitle} pageDesc={pageDesc} canonicalUrl={canonicalUrl} imageUrl={post.imageUrl}/>
        <body>
            <SiteHeader entries={entries}/>
            <main>
                <article className="page">
                    <header className="article-header">
                        <h1 className="entry-title">{post.title}</h1>
                        <p>Global access to education has expanded rapidly over the last century, as governments have made public schooling a priority.</p>
                    </header>
                    <div className="article-byline">
                        <div className="container">
                            <div className="byline-block">
                                <h3>Authors</h3>
                                {post.authors.map(author => <p className="author">{author}</p>)}
                            </div>
                            <div className="byline-block">
                                <h3>Affiliations</h3>
                                <p>University of Oxford</p>
                            </div>
                            <div className="byline-block">
                                <h3>Published</h3>
                                <p>{post.date.toDateString()}</p>
                            </div>
                            <div className="byline-block">
                                <h3>DOI</h3>
                                <p>10.23915/owid.00008</p>
                            </div>
                        </div>
                    </div>
                    <div className="article-content" dangerouslySetInnerHTML={{__html: post.html}}/>
                    {post.footnotes.length > 0 && <footer className="article-footer">
                        <section className="footnotes">
                            <h3 id="footnotes">Footnotes</h3>
                            <ol className="side-matter side-matter-list" style={{'list-style-type': 'decimal', opacity: 1}}>
                                {post.footnotes.map((footnote, i) =>
                                    <li id={`note-${i+1}`} className="side-matter side-matter-note" style={{'margin-top': '0px'}}>
                                        <div className="side-matter side-matter-text">
                                            <p dangerouslySetInnerHTML={{__html: footnote}}/>
                                        </div>
                                    </li>
                                )}
                            </ol>
                        </section>
                    </footer>}
                </article>
            </main>
            <div id="wpadminbar" style={{display: 'none'}}>
                <div className="quicklinks" id="wp-toolbar" role="navigation" aria-label="Toolbar">
                    <ul id="wp-admin-bar-root-default" className="ab-top-menu">
                        <li id="wp-admin-bar-site-name" className="menupop">
                            <a className="ab-item" aria-haspopup="true" href="/wp-admin/">Our World In Data</a>
                        </li>
                        <li id="wp-admin-bar-edit"><a className="ab-item" href={`${WORDPRESS_URL}/wp-admin/post.php?post=${post.id}&action=edit`}>Edit Page</a></li>
                    </ul>
                </div>
            </div>
            <SiteFooter/>
        </body>
    </html>
}