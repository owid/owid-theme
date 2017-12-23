import * as cheerio from 'cheerio'
const urlSlug = require('url-slug')
const wpautop = require('wpautop')
import {last} from 'lodash'
import * as settings from './settings'

export function formatContent(html: string): { footnotes: string[], excerpt: string, html: string } {
    //console.log(html.split(/(\r\n)+/).filter(p => p.match(/\w/)))
    //html = html.split(/(\r\n)+/).filter(ps=> p.match(/\w/)).map(p => `<p>${p}</p>`).join("")

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
    if (settings.HTTPS_ONLY)
        html = html.replace(new RegExp("http://", 'g'), "https://")
    else
        html = html.replace(new RegExp("https://", 'g'), "http://")

    // Use relative urls wherever possible
    html = html.replace(new RegExp(settings.WORDPRESS_URL, 'g'), "")
        .replace(new RegExp("https?://ourworldindata.org", 'g'), "")



    // In the final production version, make sure we use https urls
            .replace(new RegExp("/wp-content/uploads/nvd3", 'g'), "https://www.maxroser.com/owidUploads/nvd3")
            .replace(new RegExp("/wp-content/uploads/datamaps", 'g'), "https://www.maxroser.com/owidUploads/datamaps")

    const $ = cheerio.load(html)

    // Replace grapher iframes with iframeless embedding figure elements
    $("iframe").each((_, el) => {
        const src = el.attribs['src'] || ""
        if (src.match(/\/grapher\//)) {
            $(el).replaceWith(`<figure data-grapher-src="${src.replace(/.*(?=\/grapher\/)/, '')}"/>`)
        }    
    })

    // Deep link the headings
    $("h1, h2, h3, h4").each((_, el) => {
        const slug = urlSlug($(el).text())
        $(el).attr('id', slug).prepend(`<a class="deep-link" href="#${slug}"></a>`)
    })

    const excerpt = $($("p")[0]).text()

    return { footnotes: footnotes, excerpt: excerpt, html: $.html() }
}

export function formatAuthors(authors: string[]): string {
    if (authors.indexOf("Max Roser") === -1)
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