import * as wpdb from "./wpdb"
import {ArticlePage} from './views/ArticlePage'
import {BlogPostPage} from './views/BlogPostPage'
import {BlogIndexPage} from './views/BlogIndexPage'
import {FrontPage} from './views/FrontPage'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'

async function renderPageById(id: number): Promise<string> {
    const authorship = await wpdb.getAuthorship()

    const rows = await wpdb.query(`
        SELECT ID, post_title, post_date, post_content, post_type FROM wp_posts AS post WHERE ID=?
    `, [id])

    const row = rows[0]

    const page = {
        title: row.post_title,
        content: row.post_content,
        date: new Date(row.post_date),
        authors: authorship.get(row.ID) || []
    }

    const entries = await wpdb.getEntriesByCategory()

    if (rows[0].post_type === 'post')
        return ReactDOMServer.renderToStaticMarkup(<BlogPostPage entries={entries} page={page}/>)
    else
        return ReactDOMServer.renderToStaticMarkup(<ArticlePage entries={entries} page={page}/>)
}

async function renderFrontPage() {
    const postRows = await wpdb.query(`
        SELECT ID, post_title, post_date, post_name FROM wp_posts
        WHERE post_status='publish' AND post_type='post' ORDER BY post_date DESC LIMIT 6`)
    
    const permalinks = await wpdb.getCustomPermalinks()

    const posts = postRows.map(row => {
        return {
            title: row.post_title,
            date: new Date(row.post_date),
            slug: permalinks.get(row.ID)||row.post_name
        }
    })

    const entries = await wpdb.getEntriesByCategory()

    return ReactDOMServer.renderToStaticMarkup(<FrontPage entries={entries} posts={posts}/>)
}

async function renderBlog(pageNum: number) {
    const postsPerPage = 20

    const postRows = await wpdb.query(`
        SELECT ID, post_title, post_date, post_name FROM wp_posts
        WHERE post_status='publish' AND post_type='post' ORDER BY post_date DESC LIMIT ${postsPerPage} OFFSET ${postsPerPage*(pageNum-1)} `)
    
    const permalinks = await wpdb.getCustomPermalinks()
    const authorship = await wpdb.getAuthorship()

    const posts = postRows.map(row => {
        return {
            title: row.post_title,
            date: new Date(row.post_date),
            slug: permalinks.get(row.ID)||row.post_name,
            authors: authorship.get(row.ID)||[]
        }
    })

    const entries = await wpdb.getEntriesByCategory()

    return ReactDOMServer.renderToStaticMarkup(<BlogIndexPage entries={entries} posts={posts}/>)
}

async function main(target: string) {
    try {
        if (target === 'front') {
            console.log(await renderFrontPage())
        } else if (target == "blog") {
            const pageNum = process.argv[3] ? parseInt(process.argv[3]) : 1
            console.log(await renderBlog(pageNum))            
        } else {
            console.log(await renderPageById(parseInt(target)))
        }
    } catch (err) {
        console.error(err)
    } finally {
        wpdb.end()
    }
}

main(process.argv[2])
