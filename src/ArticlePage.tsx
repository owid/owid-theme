import * as settings from './settings'
import * as React from 'react'
import {SiteFooter} from './SiteFooter'

export interface PageInfo {
    title: string
    content: string
}

export const ArticlePage = (props: { page: PageInfo }) => {
    const {page} = props
    return <html>
        <head>
            <link rel="stylesheet" href={`${settings.STATIC_ROOT}/owid.css`}/>
        </head>
        <body>
            <article>
                <header className="article-header">
                    <h1 className="entry-title">{page.title}</h1>
                </header>
                <div dangerouslySetInnerHTML={{__html: page.content}}/>
            </article>
            <SiteFooter/>
        </body>
    </html>
}