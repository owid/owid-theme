import * as wpdb from "./wpdb"
import {ArticlePage} from './views/ArticlePage'
import {BlogPostPage} from './views/BlogPostPage'
import {BlogIndexPage} from './views/BlogIndexPage'
import {FrontPage} from './views/FrontPage'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import * as url from 'url'
import * as path from 'path'
import * as glob from 'glob'
import * as _ from 'lodash'
import * as fs from 'fs-extra'
import { WORDPRESS_DIR } from './settings'
import { formatPost } from './formatting'

export async function renderPageById(id: number): Promise<string> {
    const rows = await wpdb.query(`
        SELECT * FROM wp_posts AS post WHERE ID=?
    `, [id])

    const post = await wpdb.getFullPost(rows[0])
    const entries = await wpdb.getEntriesByCategory()
    const formatted = await formatPost(post)

    if (rows[0].post_type === 'post')
        return ReactDOMServer.renderToStaticMarkup(<BlogPostPage entries={entries} post={formatted}/>)
    else
        return ReactDOMServer.renderToStaticMarkup(<ArticlePage entries={entries} post={formatted}/>)
}

export async function renderFrontPage() {
    const postRows = await wpdb.query(`
        SELECT ID, post_title, post_date, post_name FROM wp_posts
        WHERE post_status='publish' AND post_type='post' ORDER BY post_date DESC LIMIT 6`)
    
    const permalinks = await wpdb.getPermalinks()

    const posts = postRows.map(row => {
        return {
            title: row.post_title,
            date: new Date(row.post_date),
            slug: permalinks.get(row.ID, row.post_name)            
        }
    })

    const entries = await wpdb.getEntriesByCategory()

    return ReactDOMServer.renderToStaticMarkup(<FrontPage entries={entries} posts={posts}/>)
}

export async function renderBlogByPageNum(pageNum: number) {
    const postsPerPage = 21

    const allPosts = await wpdb.getBlogIndex()

    const numPages = Math.ceil(allPosts.length/postsPerPage)
    const posts = allPosts.slice((pageNum-1)*postsPerPage, pageNum*postsPerPage)
    
    for (const post of posts) {
        if (post.imageUrl) {
            // Find a smaller version of this image
            try {
                const pathname = url.parse(post.imageUrl).pathname as string
                const paths = glob.sync(path.join(WORDPRESS_DIR, pathname.replace(/.png/, "*.png")))
                const sortedPaths = _.sortBy(paths, path => fs.statSync(path).size)
                post.imageUrl = sortedPaths[sortedPaths.length-3].replace(WORDPRESS_DIR, '')    
            } catch (err) {
                console.error(err)
                // Just use the big one
            }
        }
    }

    const entries = await wpdb.getEntriesByCategory()
    return ReactDOMServer.renderToStaticMarkup(<BlogIndexPage entries={entries} posts={posts} pageNum={pageNum} numPages={numPages}/>)
}

async function main(target: string) {
    try {
        if (target === 'front') {
            console.log(await renderFrontPage())
        } else if (target == "blog") {
            const pageNum = process.argv[3] ? parseInt(process.argv[3]) : 1
            console.log(await renderBlogByPageNum(pageNum === 0 ? 1 : pageNum))            
        } else {
            console.log(await renderPageById(parseInt(target)))
        }
    } catch (err) {
        console.error(err)
    } finally {
        wpdb.end()
    }
}

if (require.main == module)
    main(process.argv[2])
