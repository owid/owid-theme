import {createConnection, DatabaseConnection} from './database'
import * as request from 'request-promise'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as glob from 'glob'
import {without} from 'lodash'
import * as shell from 'shelljs'

// Static site generator using Wordpress

export interface WPBakerProps {
    database: string
    wordpressUrl: string
    wordpressDir: string
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
        let requestSlugs = []
        let postSlugs = []
        for (const row of rows) {
            const slug = (permalinks[row.ID] || row.post_name).replace(/\/$/, "")
            postSlugs.push(slug)

            if (!forceUpdate) {
                try {
                    const outPath = path.join(outDir, `${slug}.html`)
                    const stat = fs.statSync(outPath)
//                    console.log(`${stat.mtime} ${row.post_modified} ${slug}`)
                    if (stat.mtime >= row.post_modified) {
                        // No newer version of this post, don't bother to bake
                        continue
                    }
                } catch (err) {
                    // File likely doesn't exist, proceed
                }    
            }

            requestSlugs.push(slug)

            if (requestSlugs.length >= 10) {
                // Scrape in little batches to avoid overwhelming the server
                await Promise.all(requestSlugs.map(slug => this.bakePost(slug)))
                requestSlugs = []
            }
        }

        await Promise.all(requestSlugs.map(slug => this.bakePost(slug)))

        // Delete any previously rendered posts that aren't in the database
        const existingSlugs = glob.sync(`${outDir}/**/*.html`).map(path => path.replace(`${outDir}/`, '').replace(".html", "")).filter(path => !path.startsWith('wp-') && path !== "index")
        const toRemove = without(existingSlugs, ...postSlugs)
        for (const slug of toRemove) {
            console.log(`DELETING ${outDir}/${slug}.html`)
            await fs.unlink(`${outDir}/${slug}.html`)
        }
    }

    async bakeAssets() {
        const {wordpressDir, outDir} = this.props
        shell.exec(`rsync -havz --delete ${wordpressDir}/wp-content ${outDir}/`)
        shell.exec(`rsync -havz --delete ${wordpressDir}/wp-includes ${outDir}/`)
    }

    async bakeAll() {
        await this.bakePosts()
        await this.bakeRedirects()
        await this.bakeAssets()
    }

    exec(cmd: string) {
        console.log(cmd)
        shell.exec(cmd)
    }

    async deploy(authorEmail?: string, authorName?: string, commitMsg?: string) {
        const {outDir} = this.props
        if (authorEmail && authorName && commitMsg) {
            this.exec(`cd ${outDir} && git add -A . && git commit --author='${authorName} <${authorEmail}>' -a -m '${commitMsg}'`)
        } else {
            this.exec(`cd ${outDir} && git add -A . && git commit -a -m "Automated update"`)
        }
        this.exec(`cd ${outDir} && git push origin master`)
    }

    end() {
        this.db.end()
    }
}