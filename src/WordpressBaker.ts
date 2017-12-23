import * as request from 'request-promise'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as glob from 'glob'
import {without, chunk} from 'lodash'
import * as shell from 'shelljs'
import * as wpdb from './wpdb'
import * as settings from './settings'

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
    stagedFiles: string[] = []
    constructor(props: WPBakerProps) {
        this.props = props;
        (settings as any).IS_BAKING = true
    }

    async bakeRedirects() {
        const {props} = this
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
    
        const rows = await wpdb.query(`SELECT url, action_data, action_code FROM wp_redirection_items`)
        redirects.push(...rows.map(row => `${row.url} ${row.action_data} ${row.action_code}`))

        const outPath = path.join(props.outDir, `_redirects`)
        await fs.writeFile(path.join(props.outDir, `_redirects`), redirects.join("\n"))
        this.stage(outPath)
    }

    async bakePost(slug: string) {
        const {wordpressUrl, outDir} = this.props

        try {
            let html = await request(`${wordpressUrl}/${slug}`)
    
            if (slug === "/") slug = "index"
            const outPath = path.join(outDir, `${slug}.html`)
            await fs.mkdirp(path.dirname(outPath))
        
            await fs.writeFile(outPath, html)
            this.stage(outPath)
        } catch (err) {
            if (slug === "404") {
                const outPath = path.join(outDir, `404.html`)
                fs.writeFile(outPath, err.response.body)
                this.stage(outPath)
            } else {
                console.error(err)
            }
        }
    }
    
    async bakePosts() {
        const {outDir, forceUpdate} = this.props
        const postsQuery = wpdb.query(`SELECT ID, post_name, post_modified FROM wp_posts WHERE (post_type='page' OR post_type='post') AND post_status='publish'`)
    
        const permalinks = await wpdb.getCustomPermalinks()
        const rows = await postsQuery
    
        await this.bakePost("404")
        await this.bakePost("/")
        let requestSlugs = []
        let postSlugs = []
        for (const row of rows) {
            const slug = (permalinks.get(row.ID) || row.post_name).replace(/\/$/, "")
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
            const outPath = `${outDir}/${slug}.html`
            await fs.unlink(outPath)
            this.stage(outPath, `DELETING ${outPath}`)
        }
    }

    async bakeBlog() {
        const posts = await wpdb.query(`SELECT ID FROM wp_posts WHERE (post_type='post') AND post_status='publish'`)
        const numPages = Math.ceil(posts.length/20)
        const requests = []
        for (let i = 2; i <= numPages; i++) {
            requests.push(this.bakePost(`blog/page/${i}`))
        }
        await Promise.all(requests)

        // RSS feed
        try {
            const {outDir, wordpressUrl} = this.props
            let feed = await request(`${wordpressUrl}/feed/`)

            await fs.mkdirp(path.join(outDir, 'feed'))
            const outPath = path.join(outDir, 'feed/index.xml')
            await fs.writeFile(outPath, feed)
            this.stage(outPath)
        } catch (err) {
            console.error(err)
        }
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

    stage(outPath: string, msg?: string) {
        console.log(msg||outPath)
        this.stagedFiles.push(outPath)
    }

    exec(cmd: string) {
        console.log(cmd)
        shell.exec(cmd)
    }

    async deploy(commitMsg: string, authorEmail?: string, authorName?: string) {
        const {outDir} = this.props
        for (const files of chunk(this.stagedFiles, 100)) {
            this.exec(`cd ${outDir} && git add -A ${files.join(" ")}`)
        }
        if (authorEmail && authorName && commitMsg) {
            this.exec(`cd ${outDir} && git add -A . && git commit --author='${authorName} <${authorEmail}>' -a -m '${commitMsg}' && git push origin master`)
        } else {
            this.exec(`cd ${outDir} && git add -A . && git commit -a -m '${commitMsg}' && git push origin master`)
        }
    }

    end() {
        wpdb.end()
    }
}