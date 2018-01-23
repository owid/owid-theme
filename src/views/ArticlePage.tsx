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
                                <a href="/about/#the-team">by {authorsText}</a><a className="citation-note js-only"><sup>[cite]</sup></a>
                            </div>
                            <div className="citation-guideline">
                                OWID presents work for many different people and organizations. When citing this entry, please also cite the original data source. This entry can be cited as:<br/><br/>{authorsText} ({publishedYear}) - "{pageTitle}". <em>Published online at OurWorldInData.org.</em> Retrieved from: '{canonicalUrl}' [Online Resource]
                            </div>
                        </header>
                        <div className="article-content" dangerouslySetInnerHTML={{__html: post.html}}/>
                        {post.footnotes.length > 0 && <footer className="article-footer">
                            <h3 id="footnotes">Footnotes</h3>
                            <ol className="footnotes">
                                {post.footnotes.map((footnote, i) =>
                                    <li id={`note-${i+1}`}>
                                        <p dangerouslySetInnerHTML={{__html: footnote}}/>
                                    </li>
                                )}
                            </ol>
                        </footer>}
                    </article>
                </div>
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