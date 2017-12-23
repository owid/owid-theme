import {wpdb} from "./wpdb"
import {ArticlePage, PageInfo} from './views/ArticlePage'
import {FrontPage} from './views/FrontPage'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import {decodeHTML} from 'entities'

async function renderPageById(id: number) {
    const authorRows = await wpdb.query(`
        SELECT object_id, terms.description FROM wp_term_relationships AS rels
        LEFT JOIN wp_term_taxonomy AS terms ON terms.term_taxonomy_id=rels.term_taxonomy_id 
        WHERE terms.taxonomy='author'
    `)

    const authorship = new Map<number, string[]>()
    for (const row of authorRows) {
        let authors = authorship.get(row.object_id)
        if (!authors) {
            authors = []
            authorship.set(row.object_id, authors)
        }
        authors.push(row.description.split(" ").slice(0, 2).join(" "))
    }

    const rows = await wpdb.query(`
        SELECT ID, post_title, post_content FROM wp_posts AS post WHERE ID=?
    `, [id])
    for (const row of rows) {
        const page: PageInfo = {
            title: row.post_title,
            content: row.post_content,
            authors: authorship.get(row.ID) || []
        }

        const entries = await getEntriesByCategory()

        console.log(ReactDOMServer.renderToStaticMarkup(<ArticlePage entries={entries} page={page}/>))
    }
}

async function getEntriesByCategory() {
    const categoryOrder = [
        "Population",
        "Health",
        "Food" ,
        "Energy",
        "Environment",
        "Technology",
        "Growth &amp; Inequality",
        "Work &amp; Life",
        "Public Sector",
        "Global Connections",
        "War &amp; Peace",
        "Politics" ,
        "Violence &amp; Rights",
        "Education",
        "Media",
        "Culture"
    ]

    const categoriesByPageId = new Map<number, string[]>()
    const rows = await wpdb.query(`
        SELECT object_id, terms.name FROM wp_term_relationships AS rels
        LEFT JOIN wp_terms AS terms ON terms.term_id=rels.term_taxonomy_id
    `)

    for (const row of rows) {
        let cats = categoriesByPageId.get(row.object_id)
        if (!cats) {
            cats = []
            categoriesByPageId.set(row.object_id, cats)
        }
        cats.push(row.name)
    }

    const pageRows = await wpdb.query(`
        SELECT posts.ID, post_title, post_date, post_name, perma.meta_value AS custom_permalink, star.meta_value AS starred FROM wp_posts AS posts
        LEFT JOIN wp_postmeta AS perma ON perma.post_id=ID AND perma.meta_key='custom_permalink'
        LEFT JOIN wp_postmeta AS star ON star.post_id=ID AND star.meta_key='_ino_star'
        WHERE posts.post_type='page' AND posts.post_status='publish' ORDER BY posts.menu_order ASC
    `)

    return categoryOrder.map(cat => {
        const rows = pageRows.filter(row => {
            const cats = categoriesByPageId.get(row.ID)
            return cats && cats.indexOf(cat) !== -1
        })
        
        const entries = rows.map(row => {
            return {
                slug: row.custom_permalink||row.post_name,
                title: row.post_title,
                starred: row.starred == "1"
            }
        })

        return {
            name: decodeHTML(cat),
            entries: entries
        }
    })
}

async function renderFrontPage() {
    const postRows = await wpdb.query(`
        SELECT post_title, post_date, post_name, meta.meta_value as custom_permalink FROM wp_posts
        INNER JOIN wp_postmeta AS meta ON meta.post_id=ID AND meta.meta_key='custom_permalink'
        WHERE post_status='publish' AND post_type='post' ORDER BY post_date DESC LIMIT 6`)
    const permalinkRows = await wpdb.query(`SELECT post_id, meta_value FROM wp_postmeta WHERE meta_key='custom_permalink'`)

    const posts = postRows.map(row => {
        return {
            title: row.post_title,
            date: new Date(row.post_date),
            slug: row.custom_permalink||row.post_name
        }
    })

    const entries = await getEntriesByCategory()

    console.log(ReactDOMServer.renderToStaticMarkup(<FrontPage entries={entries} posts={posts}/>))
}

async function main(target: string) {
    try {
        if (target === 'front') {
            await renderFrontPage()
        } else {
            await renderPageById(parseInt(target))
        }    
    } catch (err) {
        console.error(err)
    } finally {
        wpdb.end()
    }
}

main(process.argv[2])
