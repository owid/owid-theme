import * as cheerio from 'cheerio'
const urlSlug = require('url-slug')
const wpautop = require('wpautop')
import {last} from 'lodash'
import * as React from 'react'
import * as ReactDOMServer from 'react-dom/server'
import {HTTPS_ONLY, WORDPRESS_URL, BAKED_DIR}  from './settings'
import { getTables, getUploadedImages, FullPost } from './wpdb'
import Tablepress from './views/Tablepress'
import {GrapherExports} from './grapherUtil'
import * as path from 'path'

export interface FormattedPost {
    id: number
    type: 'post'|'page'
    slug: string
    title: string
    date: Date
    modifiedDate: Date
    authors: string[]
    html: string
    footnotes: string[]
    excerpt: string
    imageUrl?: string
    tocHeadings: { text: string, slug: string, isSubheading: boolean }[]
}

function romanize(num: number) {
	if (!+num)
		return "";
	var digits = String(+num).split(""),
		key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
				"","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
				"","I","II","III","IV","V","VI","VII","VIII","IX"],
		roman = "",
		i = 3;
	while (i--)
		roman = (key[+(digits.pop() as any) + (i * 10)] || "") + roman;
	return Array(+digits.join("") + 1).join("M") + roman;
}

export async function formatPost(post: FullPost, grapherExports?: GrapherExports): Promise<FormattedPost> {
    let html = post.content

    // Remove comments and standardize spacing
    html = html.replace(/<!--[^>]+-->/g, "").replace(/\r\n/g, "\n").replace(/(\n\s*)(\n\s*)/g, "\n\n")

    // Footnotes
    const footnotes: string[] = []
    html = html.replace(/\[ref\]([\s\S]*?)\[\/ref\]/gm, (_, footnote) => {
        footnotes.push(footnote)
        const i = footnotes.length
        return `<a id="ref-${i}" class="side-matter side-matter-ref" href="#note-${i}"><sup class="side-matter side-matter-sup">${i}</sup></a>`
    })
    
    // Replicate wordpress formatting (thank gods there's an npm package)
    if (!html.match(/<!--raw-->/))
        html = wpautop(html)

    // Standardize protocols used in links
    if (HTTPS_ONLY)
        html = html.replace(new RegExp("http://", 'g'), "https://")
    else
        html = html.replace(new RegExp("https://", 'g'), "http://")

    // Use relative urls wherever possible
    html = html.replace(new RegExp(WORDPRESS_URL, 'g'), "")
        .replace(new RegExp("https?://ourworldindata.org", 'g'), "")

    // Insert [table id=foo] tablepress tables
    const tables = await getTables()
    html = html.replace(/\[table\s+id=(\d+)\s*\/\]/g, (match, tableId) => {
        const table = tables.get(tableId)
        if (table)
            return ReactDOMServer.renderToStaticMarkup(<Tablepress data={table.data}/>)
        else
            return "UNKNOWN TABLE"
    })

    // These old things don't work with static generation, link them through to maxroser.com
    html = html.replace(new RegExp("/wp-content/uploads/nvd3", 'g'), "https://www.maxroser.com/owidUploads/nvd3")
            .replace(new RegExp("/wp-content/uploads/datamaps", 'g'), "https://www.maxroser.com/owidUploads/datamaps")

    const $ = cheerio.load(html)

    // Replace grapher iframes with static previews
    if (grapherExports) {
        const grapherIframes = $("iframe").toArray().filter(el => (el.attribs['src']||'').match(/\/grapher\//))
        for (const el of grapherIframes) {
            const src = el.attribs['src']
            const chart = grapherExports.get(src)
            if (chart) {
                const output = `<div class="interactivePreview"><a href="${src}" target="_blank"><div><img src="${chart.svgUrl}" data-grapher-src="${src}"/></div></a></div>`
                $(el).replaceWith(output)
            }
        }    
    }

    // Image processing
    const uploadDex = await getUploadedImages()
    for (const el of $("img").toArray()) {
        // Open full-size image in new tab
        if (el.parent.tagName === "a") {
            el.parent.attribs['target'] = '_blank'
        }

        // Set srcset to load image responsively
        const src = el.attribs['src']||""
        const upload = uploadDex.get(path.basename(src))
        if (upload && upload.variants.length) {
            el.attribs['srcset'] = upload.variants.map(v => `${v.url} ${v.width}w`).join(", ")
        }
    }

    // Table of contents and deep links
    const hasToc = post.type === 'page' && post.slug !== 'about'
    let openHeadingIndex = 0
    let openSubheadingIndex = 0
    const tocHeadings: { text: string, slug: string, isSubheading: boolean }[] = []
    $("h1, h2, h3, h4").each((_, el) => {
        const $heading = $(el);
        const headingText = $heading.text()
        // We need both the text and the html because may contain footnote
        let headingHtml = $heading.html() as string
        const slug = urlSlug(headingText)

        // Table of contents
        if (hasToc) {
            if ($heading.is("#footnotes") && footnotes.length > 0) {
                tocHeadings.push({ text: headingText, slug: "footnotes", isSubheading: false })
            } else if (!$heading.is('h1') && !$heading.is('h4')) {
                // Inject numbering into the text as well
                if ($heading.is('h2')) {
                    openHeadingIndex += 1;
                    openSubheadingIndex = 0;
                } else if ($heading.is('h3')) {
                    openSubheadingIndex += 1;
                }
    
                if (openHeadingIndex > 0) {
                    if ($heading.is('h2')) {
                        headingHtml = romanize(openHeadingIndex) + '. ' + headingHtml;
                        $heading.html(headingHtml)
                        tocHeadings.push({ text: $heading.text(), slug: slug, isSubheading: false })
                    } else {
                        headingHtml = romanize(openHeadingIndex) + '.' + openSubheadingIndex + ' ' + headingHtml;
                        $heading.html(headingHtml)
                        tocHeadings.push({ text: $heading.text(), slug: slug, isSubheading: true })
                    }					
                }
            }    
        }

        // Deep link
        $heading.attr('id', slug).prepend(`<a class="deep-link" href="#${slug}"></a>`)
    })

    return {
        id: post.id,
        type: post.type,
        slug: post.slug,
        title: post.title,
        date: post.date,
        modifiedDate: post.modifiedDate,
        authors: post.authors,
        html: $.html(),
        footnotes: footnotes,
        excerpt: post.excerpt || $($("p")[0]).text(),
        imageUrl: post.imageUrl,
        tocHeadings: tocHeadings
    }
}

export function formatAuthors(authors: string[], requireMax?: boolean): string {
    if (requireMax && authors.indexOf("Max Roser") === -1)
        authors.push("Max Roser")

    let authorsText = authors.slice(0, -1).join(", ")
    if (authorsText.length == 0)
        authorsText = authors[0]
    else
        authorsText += ` and ${last(authors)}`
        
    return authorsText
}

export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })
}