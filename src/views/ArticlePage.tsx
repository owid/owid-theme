import * as settings from '../settings'
import * as React from 'react'
import { SiteHeader, CategoryWithEntries } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import * as cheerio from 'cheerio'
const wpautop = require('wpautop')

export interface PageInfo {
    title: string
    content: string
}

function rewriteHtml(html: string): { footnotes: string[], html: string } {
    //console.log(html.split(/(\r\n)+/).filter(p => p.match(/\w/)))
    //html = html.split(/(\r\n)+/).filter(p => p.match(/\w/)).map(p => `<p>${p}</p>`).join("")

    // Footnotes
    const footnotes: string[] = []
    html = html.replace(/\[ref\]([\s\S]*?)\[\/ref\]/gm, (_, footnote) => {
        footnotes.push(footnote)
        const i = footnotes.length
        return `<a id="ref-${i}" class="side-matter side-matter-ref" href="#note-${i}"><sup class="side-matter side-matter-sup">${i}</sup></a>`
    })
    
    // Replicate wordpress formatting (thank gods there's an npm package)
    if (!html.match(/<!--raw-->/))
        html = wpautop(html)

    const $ = cheerio.load(html)

    // Replace grapher iframes with iframeless embedding figure elements
    $("iframe").each((_, el) => {
        const src = el.attribs['src'] || ""
        if (src.match(/\/grapher\//)) {
            $(el).replaceWith(`<figure data-grapher-src="${src.replace(/.*(?=\/grapher\/)/, '')}"/>`)
        }    
    })

    return { footnotes: footnotes, html: $.html() }
}

export const ArticlePage = (props: { entries: CategoryWithEntries[], page: PageInfo }) => {
    const {entries, page} = props
    const {footnotes, html} = rewriteHtml(page.content)
    return <html>
        <head>
            <link rel="stylesheet" href={`${settings.STATIC_ROOT}/css/owid.css`}/>
        </head>
        <body>
            <SiteHeader entries={entries}/>
            <main id="main" className="site-main">
                <div className="page-with-sidebar clearfix">
                    <div className="entry-sidebar">
                        <nav className="entry-toc">
                        </nav>
                    </div>
                    <article className="page">
                        <header className="article-header">
                            <h1 className="entry-title">{page.title}</h1>
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
            <script src={`${settings.STATIC_ROOT}/js/owid.js`}/>
            <script src="/grapher/embedCharts.js"/>
            <SiteFooter/>
        </body>
    </html>
}