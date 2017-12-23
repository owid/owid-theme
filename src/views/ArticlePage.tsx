import * as settings from '../settings'
import * as React from 'react'
import {SiteHeader} from './SiteHeader'
import {SiteFooter} from './SiteFooter'
import * as cheerio from 'cheerio'

export interface PageInfo {
    title: string
    content: string
}

function rewriteHtml(html: string): string {
    const $ = cheerio.load(html)

    // Replace grapher iframes with iframeless embedding figure elements
    $("iframe").each((_, el) => {
        const src = el.attribs['src'] || ""
        if (src.match(/\/grapher\//)) {
            $(el).replaceWith(`<figure data-grapher-src="${src.replace(/.*(?=\/grapher\/)/, '')}"/>`)
        }    
    })

    return $.html()
}

export const ArticlePage = (props: { page: PageInfo }) => {
    const {page} = props
    const contentHtml = rewriteHtml(page.content)
    return <html>
        <head>
            <link rel="stylesheet" href={`${settings.STATIC_ROOT}/css/owid.css`}/>
        </head>
        <body>
            <SiteHeader/>
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
                        <div className="article-content" dangerouslySetInnerHTML={{__html: contentHtml}}/>
                    </article>
                </div>
            </main>
            <script src="/grapher/embedCharts.js"/>
            <SiteFooter/>
        </body>
    </html>
}