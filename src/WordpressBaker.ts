import {createConnection, DatabaseConnection} from './database'
import * as request from 'request-promise'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as glob from 'glob'
import {without} from 'lodash'

// Static site generator using Wordpress

export interface WPBakerProps {
    database: string
    wordpressUrl: string
    outDir: string
    forceUpdate?: boolean
}

export class WordpressBaker {
    props: WPBakerProps
    db: DatabaseConnection
    constructor(props: WPBakerProps) {
        this.props = props
        this.db = createConnection({ database: props.database })
    }

    async bakeRedirects() {
        const {db, props} = this
        const redirects = [
            "http://owid.netlify.com* https://owid.netlify.com:splat",
            "/grapher/* https://owid-grapher.netlify.com/grapher/:splat 200"
        ]
    
        const rows = await db.query(`SELECT url, action_data, action_code FROM wp_redirection_items`)
        redirects.push(...rows.map(row => `${row.url} ${row.action_data} ${row.action_code}`))

        const outPath = path.join(props.outDir, `_redirects`)
        await fs.writeFile(path.join(props.outDir, `_redirects`), redirects.join("\n"))
        console.log(outPath)
    }

    async bakePost(slug: string) {
        const {wordpressUrl, outDir} = this.props

        try {
            let html = await request(`${wordpressUrl}/${slug}`)
    
            if (slug === "/") slug = "index"
            const outPath = path.join(outDir, `${slug}.html`)
            await fs.mkdirp(path.dirname(outPath))
    
            html = html.replace(new RegExp(wordpressUrl, 'g'), "")
                .replace(new RegExp("http://", 'g'), "https://")
                .replace(new RegExp("https://ourworldindata.org", 'g'), "https://owid.netlify.com")
                .replace(new RegExp("/grapher/embedCharts.js", 'g'), "https://owid.netlify.com/grapher/embedCharts.js")
    
            await fs.writeFile(outPath, html)
            console.log(outPath)
        } catch (err) {
            console.error(slug, err.message)
        }
    }
    
    async getPermalinks() {
        const rows = await this.db.query(`SELECT post_id, meta_value FROM wp_postmeta WHERE meta_key='custom_permalink'`)
        const permalinks: {[postId: number]: string|undefined} = {}
        for (const row of rows) {
            permalinks[row.post_id] = row.meta_value
        }
        return permalinks
    }
    
    async bakePosts() {
        const {outDir, forceUpdate} = this.props
        const postsQuery = this.db.query(`SELECT ID, post_name, post_modified FROM wp_posts WHERE (post_type='page' OR post_type='post') AND post_status='publish'`)
    
        const permalinks = await this.getPermalinks()
        const rows = await postsQuery
    
        await this.bakePost("/")
        // Scrape in little batches to avoid overwhelming the server
        let requests = []
        let postSlugs = []
        for (const row of rows) {
            const slug = (permalinks[row.ID] || row.post_name).replace(/\/$/, "")
            postSlugs.push(slug)

            if (!forceUpdate) {
                try {
                    const outPath = path.join(outDir, `${slug}.html`)
                    const stat = fs.statSync(outPath)
                    if (stat.mtime >= row.post_modified) {
                        // No newer version of this post, don't bother to bake
                        //console.log(`304 ${slug}`)
                        continue
                    }
                } catch (err) {
                    // File likely doesn't exist, proceed
                }    
            }

            requests.push(this.bakePost(slug))

            if (requests.length >= 10 || row === rows[rows.length-1]) {
                await Promise.all(requests)
                requests = []
            }    
        }

        // Delete any previously rendered posts that aren't in the database
        const existingSlugs = glob.sync(`${outDir}/**/*.html`).map(path => path.replace(`${outDir}/`, '').replace(".html", "")).filter(path => !path.startsWith('wp-') && path !== "index")
        const toRemove = without(existingSlugs, ...postSlugs)
        for (const slug of toRemove) {
            console.log(`DELETING ${outDir}/${slug}.html`)
            await fs.unlink(`${outDir}/${slug}.html`)
        }
    }

    async bakeAll() {
        await Promise.all([
            this.bakeRedirects(),
            this.bakePosts()
        ])
    }

    end() {
        this.db.end()
    }
}