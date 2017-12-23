import {wpdb} from "./wpdb"
import {ArticlePage, PageInfo} from './views/ArticlePage'
import {FrontPage} from './views/FrontPage'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'

async function renderPageById(id: number) {
    const rows = await wpdb.query(`SELECT * FROM wp_posts WHERE id=?`, [id])
    for (const row of rows) {
        const page: PageInfo = {
            title: row.post_title,
            content: row.post_content
        }

        console.log(ReactDOMServer.renderToStaticMarkup(<ArticlePage page={page}/>))
    }
}

async function renderFrontPage() {
    const rows = await wpdb.query(`
        SELECT post_title, post_date, post_name, meta.meta_value as custom_permalink FROM wp_posts
        INNER JOIN wp_postmeta AS meta ON meta.post_id=ID AND meta.meta_key='custom_permalink'
        WHERE post_status='publish' AND post_type='post' ORDER BY post_date DESC LIMIT 6`)
    const permalinkRows = await wpdb.query(`SELECT post_id, meta_value FROM wp_postmeta WHERE meta_key='custom_permalink'`)

    const posts = rows.map(row => {
        console.log(row.post_date, new Date(row.post_date))
        return {
            title: row.post_title,
            date: new Date(row.post_date),
            slug: row.custom_permalink||row.post_name
        }
    })

    console.log(ReactDOMServer.renderToStaticMarkup(<FrontPage posts={posts}/>))
}

async function main(target: string) {
    if (target === 'front') {
        await renderFrontPage()
    } else {
        await renderPageById(parseInt(target))
    }

    wpdb.end()
}

main(process.argv[2])
