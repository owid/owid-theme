import {wpdb} from "./wpdb"
import {ArticlePage, PageInfo} from './ArticlePage'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'

async function renderPage(id: number) {
    const rows = await wpdb.query(`SELECT * FROM wp_posts WHERE id=?`, [id])
    for (const row of rows) {
        const page: PageInfo = {
            title: row.post_title,
            content: row.post_content
        }

        console.log(ReactDOMServer.renderToStaticMarkup(<ArticlePage page={page}/>))
    }

    wpdb.end()
}

renderPage(parseInt(process.argv[2]))
