import * as request from 'request-promise'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as glob from 'glob'
import {without, chunk} from 'lodash'
import * as shell from 'shelljs'
import * as _ from 'lodash'

import * as wpdb from './wpdb'
import { formatPost } from './formatting'
import { ArticlePage } from './views/ArticlePage'
import { BlogPostPage } from './views/BlogPostPage'
import * as settings from './settings'
const { BAKED_DIR, WORDPRESS_URL, WORDPRESS_DIR, BLOG_POSTS_PER_PAGE } = settings
import { renderFrontPage, renderBlogByPageNum } from './renderPage'

import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'

// Static site generator using Wordpress

export interface WPBakerProps {
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
            "/wp-admin/* https://owid.cloud/wp-admin/:splat 302",
            "/grapher/admin/* https://owid.cloud/grapher/admin/:splat 302",
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

        await this.stageWrite(path.join(BAKED_DIR, `_redirects`), redirects.join("\n"))
    }

    async bakePost(post: wpdb.FullPost) {
        const entries = await wpdb.getEntriesByCategory()
        const formatted = await formatPost(post)
        const html = ReactDOMServer.renderToStaticMarkup(
            post.type == 'post' ? <BlogPostPage entries={entries} post={formatted}/> : <ArticlePage entries={entries} post={formatted}/>
        )

        const outPath = path.join(BAKED_DIR, `${post.slug}.html`)
        await fs.mkdirp(path.dirname(outPath))        
        await this.stageWrite(outPath, html)
    }
    
    async bakePosts() {
        const {forceUpdate} = this.props
        const postsQuery = wpdb.query(`SELECT * FROM wp_posts WHERE (post_type='page' OR post_type='post') AND post_status='publish'`)
    
        const rows = await postsQuery
    
        let bakingPosts = []
        let postSlugs = []
        for (const row of rows) {
            if (row.post_name === 'blog') // Handled separately
                continue

            const post = await wpdb.getFullPost(row)
            postSlugs.push(post.slug)

           /* if (!forceUpdate) {
                try {
                    const outPath = path.join(BAKED_DIR, `${post.slug}.html`)
                    const stat = fs.statSync(outPath)
//                    console.log(`${stat.mtime} ${row.post_modified} ${slug}`)
                    if (stat.mtime >= row.post_modified) {
                        // No newer version of this post, don't bother to bake
                        continue
                    }
                } catch (err) {
                    // File likely doesn't exist, proceed
                }    
            }*/

            bakingPosts.push(post)
        }

        await Promise.all(bakingPosts.map(post => this.bakePost(post)))

        // Delete any previously rendered posts that aren't in the database
        const existingSlugs = glob.sync(`${BAKED_DIR}/**/*.html`).map(path => path.replace(`${BAKED_DIR}/`, '').replace(".html", ""))
            .filter(path => !path.startsWith('wp-') && !path.startsWith('slides') && !path.startsWith('blog') && path !== "index" && path !== "identifyadmin" && path !== "404")
        const toRemove = without(existingSlugs, ...postSlugs)
        for (const slug of toRemove) {
            const outPath = `${BAKED_DIR}/${slug}.html`
            await fs.unlink(outPath)
            this.stage(outPath, `DELETING ${outPath}`)
        }
    }

    async bakeFrontPage() {
        return this.stageWrite(`${BAKED_DIR}/index.html`, await renderFrontPage())
    }

    async bakeBlog() {
        const allPosts = await wpdb.getBlogIndex()
        const numPages = Math.ceil(allPosts.length/BLOG_POSTS_PER_PAGE)

        for (let i = 1; i <= numPages; i++) {
            const slug = i === 1 ? 'blog' : `blog/page/${i}`
            const html = await renderBlogByPageNum(i)
            this.stageWrite(`${BAKED_DIR}/${slug}.html`, html)
        }
        // RSS feed
        // let feed = await request(`${WORDPRESS_URL}/feed/`)
    }

    async bakeAssets() {
        shell.exec(`rsync -havz --delete ${WORDPRESS_DIR}/wp-content/themes/owid-theme/identifyadmin.html ${BAKED_DIR}/`)
        shell.exec(`rsync -havz --delete ${WORDPRESS_DIR}/wp-content ${BAKED_DIR}/`)
        shell.exec(`rsync -havz --delete ${WORDPRESS_DIR}/wp-includes ${BAKED_DIR}/`)
        shell.exec(`rsync -havz --delete ${WORDPRESS_DIR}/favicon* ${BAKED_DIR}/`)
        shell.exec(`rsync -havz --delete ${WORDPRESS_DIR}/slides/ ${BAKED_DIR}/slides`)
        shell.exec(`rsync -havz --delete ${WORDPRESS_DIR}/wp-content/themes/owid-theme/404.html ${BAKED_DIR}/`)
    }

    async bakeAll() {
        await this.bakeRedirects()
        await this.bakeAssets()
        await this.bakeFrontPage()
        await this.bakeBlog()
        await this.bakePosts()
    }

    async stageWrite(outPath: string, content: string) {
        await fs.mkdirp(path.dirname(outPath))
        await fs.writeFile(outPath, content)
        this.stage(outPath)
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
        for (const files of chunk(this.stagedFiles, 100)) {
            this.exec(`cd ${BAKED_DIR} && git add -A ${files.join(" ")}`)
        }
        if (authorEmail && authorName && commitMsg) {
            this.exec(`cd ${BAKED_DIR} && git add -A . && git commit --author='${authorName} <${authorEmail}>' -a -m '${commitMsg}' && git push origin master`)
        } else {
            this.exec(`cd ${BAKED_DIR} && git add -A . && git commit -a -m '${commitMsg}' && git push origin master`)
        }
    }

    end() {
        wpdb.end()
    }
}