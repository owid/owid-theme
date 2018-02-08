import * as wpdb from "./wpdb"
import { WORDPRESS_DIR } from './settings'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import {ArticlePage} from './views/ArticlePage'
import {BlogPostPage} from './views/BlogPostPage'
import * as url from 'url'
import * as path from 'path'
import * as glob from 'glob'
import * as _ from 'lodash'
import * as fs from 'fs-extra'
import { FormattedPost } from './formatting'
import { bakeGrapherUrls, getGrapherExportsByUrl } from "./grapherUtil";
import * as cheerio from 'cheerio'
import {renderToHtmlPage} from './renderPage'
import * as striptags from 'striptags'
import {decodeHTML} from 'entities'

const mjAPI = require("mathjax-node");


interface GoogleDoc {
    text: string
    html: string
}

function blockRegex(operator: string) {
    return new RegExp(`\\[${operator}\\]([\\s\\S]*?)\\[\\/${operator}\\]`, 'gm')
}

interface Blocks {
    html: string[]
    latex: string[]
}

function extractBlocks(text: string): { html: string[], latex: string[] } {
    const blocks: any = { html: [], latex: [] }
    for (const operator of ['html', 'latex']) {
        const regex = blockRegex(operator)
        text.replace(regex, (_, contents) => {
            blocks[operator].push(contents)
            return _
        })
    }
    return blocks
}

async function applyBlocks(html: string, blocks: Blocks) {
    html = await formatHtmlBlocks(html, blocks.html)
    html = await formatLatexBlocks(html, blocks.latex)
    return html
}

async function formatLatexBlocks(html: string, latexBlocks: string[]): Promise<string> {
    const compiled: string[] = []
    for (let latex of latexBlocks) {
        try {
            const result = await mjAPI.typeset({ math: latex, format: "TeX", svg: true })
            compiled.push(result.svg.replace("<svg", `<svg class="latex"`))
        } catch (err) {
            compiled.push(`${latex} (parse error: ${err})`)
        }
    }
    
    let i = -1
    return html.replace(blockRegex('latex'), _ => {
        i += 1
        return compiled[i]
    })
}

async function formatHtmlBlocks(text: string, htmlBlocks: string[]) {
    let i = -1
    return text.replace(blockRegex('html'), _ => {
        i += 1
        return decodeHTML(htmlBlocks[i])
    })
}

async function main(filehash: string) {
    const doc = JSON.parse(fs.readFileSync(path.join('/tmp', filehash)).toString()) as GoogleDoc

    // To avoid google docs html formatting messing up our special operators, we take
    // the contents from the plaintext export and then apply them to the html version later by
    // matching them up positionally
    const blocks = extractBlocks(doc.text)

    let html = doc.html

//    console.log(html)
//    return

    // Remove non-breaking spaces
    html = html.replace(/&nbsp;/g, " ")


    const $ = cheerio.load(html)

    // Remove all gdocs formatting
    $("*").removeAttr("class").removeAttr("id").removeAttr("style")


    // Extract title
    const $h1 = $("h1")
    const title = $h1.text()
    $h1.remove()

    // Remove spans
    for (const span of $("span").toArray()) {
        $(span).replaceWith($(span).contents())
    }

    // At this point, each p element corresponds to a line

    // Handle line-based operators
    for (const el of $("body > *").toArray()) {
        const text = $(el).text().trim()        
        if (text == '[source]') {
            const sourceData = $(el).nextUntil("p:empty")
            const p = $(sourceData).toArray()[0]
            p.tagName = "h5"
            $(el).replaceWith(sourceData)
        }
    }

    // Remove any empty elements
    for (const el of $("*:not(img)").toArray()) {
        const $el = $(el)
        if ($el.contents().length === 0)
            $el.remove()
    }

    html = $("body").html() as string

    html = await applyBlocks(html, blocks)

    const formatted = {
        id: 0,
        type: 'page',
        slug: 'test',
        title: title,
        date: new Date(),
        modifiedDate: new Date(),
        authors: [],
        html: html,
        footnotes: [],
        excerpt: $($("p")[0]).text(),
        imageUrl: "",
        tocHeadings: []
    } as FormattedPost

    const entries = await wpdb.getEntriesByCategory()
    console.log(renderToHtmlPage(<ArticlePage entries={entries} post={formatted}/>))
    //console.log(`<script>window.doc = ${JSON.stringify(doc)}</script>`)

    wpdb.end()

}

if (require.main == module)
    main(process.argv[2])
