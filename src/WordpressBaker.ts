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
            "/chart-builder/* /grapher/:splat 301",
            "/grapher/public/* /grapher/:splat 301",
            "/grapher/view/* /grapher/:splat 301",
            "/roser/* https://www.maxroser.com/roser/:splat 302",
            "/wp-content/uploads/nvd3/* https://www.maxroser.com/owidUploads/nvd3/:splat 302",
            "/wp-content/uploads/datamaps/* https://www.maxroser.com/owidUploads/datamaps/:splat 302",
            "/grapher/* https://owid-grapher.netlify.com/grapher/:splat 200",
            "/mispy/sdgs/* https://owid-sdgs.netlify.com/:splat 302",
            "/slides/Max_PPT_presentations/* https://www.maxroser.com/slides/Max_PPT_presentations/:splat 302",
            "/slides/Max_Interactive_Presentations/* https://www.maxroser.com/slides/Max_Interactive_Presentations/:splat 302"
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
                .replace(new RegExp("https://ourworldindata.org", 'g'), "https://static.ourworldindata.org")
                .replace(new RegExp("/grapher/embedCharts.js", 'g'), "https://static.ourworldindata.org/grapher/embedCharts.js")
                .replace(new RegExp("/wp-content/uploads/nvd3", 'g'), "https://www.maxroser.com/owidUploads/nvd3")
                .replace(new RegExp("/wp-content/uploads/datamaps", 'g'), "https://www.maxroser.com/owidUploads/datamaps")
    
            await fs.writeFile(outPath, html)
            console.log(outPath)
        } catch (err) {
            if (slug === "404") {
                const outPath = path.join(outDir, `404.html`)
                fs.writeFile(outPath, err.response.body)
                console.log(outPath)
            } else {
                console.error(err)
            }
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
    
        await this.bakePost("404")
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
        const existingSlugs = glob.sync(`${outDir}/**/*.html`).map(path => path.replace(`${outDir}/`, '').replace(".html", ""))
            .filter(path => !path.startsWith('wp-') && !path.startsWith('slides') && !path.startsWith('blog') && path !== "index" && path !== "404")
        const toRemove = without(existingSlugs, ...postSlugs)
        for (const slug of toRemove) {
            console.log(`DELETING ${outDir}/${slug}.html`)
            await fs.unlink(`${outDir}/${slug}.html`)
        }
    }

    async bakeBlog() {
        const posts = await this.db.query(`SELECT ID FROM wp_posts WHERE (post_type='post') AND post_status='publish'`)
        const numPages = Math.ceil(posts.length/20)
        const requests = []
        for (let i = 2; i <= numPages; i++) {
            requests.push(this.bakePost(`blog/page/${i}`))
        }
        await Promise.all(requests)
    }

    async bakeAssets() {
        const {wordpressDir, outDir} = this.props
        shell.exec(`rsync -havz --delete ${wordpressDir}/wp-content ${outDir}/`)
        shell.exec(`rsync -havz --delete ${wordpressDir}/wp-includes ${outDir}/`)
        shell.exec(`rsync -havz --delete ${wordpressDir}/favicon* ${outDir}/`)
        shell.exec(`rsync -havz --delete ${wordpressDir}/slides/ ${outDir}/slides`)
    }

    async bakeAll() {
        await this.bakeRedirects()
        await this.bakeAssets()
        await this.bakeBlog()
        await this.bakePosts()
    }

    exec(cmd: string) {
        console.log(cmd)
        shell.exec(cmd)
    }

    async deploy(commitMsg: string, authorEmail?: string, authorName?: string) {
        const {outDir} = this.props
        if (authorEmail && authorName && commitMsg) {
            this.exec(`cd ${outDir} && git add -A . && git commit --author='${authorName} <${authorEmail}>' -a -m '${commitMsg}'`)
        } else {
            this.exec(`cd ${outDir} && git add -A . && git commit -a -m '${commitMsg}'`)
        }
        this.exec(`cd ${outDir} && git push origin master`)
    }

    end() {
        this.db.end()
    }
}