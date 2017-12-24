import * as cheerio from 'cheerio'
const urlSlug = require('url-slug')
const wpautop = require('wpautop')
import {last} from 'lodash'
import * as settings from './settings'
import { FullPost } from './wpdb'

export interface FormattedPost {
    id: number
    type: 'post'|'page'
    slug: string
    title: string
    date: Date
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

export async function formatPost(post: FullPost): Promise<FormattedPost> {
    let html = post.content

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
        authors: post.authors,
        html: $.html(),
        footnotes: footnotes,
        excerpt: post.excerpt || $($("p")[0]).text(),
        imageUrl: post.imageUrl,
        tocHeadings: tocHeadings
    }
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