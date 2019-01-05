import {BAKED_URL, ASSETS_URL} from '../settings'
import * as React from 'react'
import moment = require('moment');

export const CitationMeta = (props: { title: string, authors: string[], date: Date }) => {
    let {title, authors, date} = props

    if (authors.indexOf("Max Roser") === -1)
        authors = authors.concat(["Max Roser"])

    return <React.Fragment>
        <meta name="citation_title" content={title}/>
        {authors.map(author => <meta name="citation_author" content={author}/>)}
        <meta name="citation_publication_date" content={moment(date).format("YYYY/MM/DD")}/>{/*"1996/05/17"/>*/}
        <meta name="citation_journal_title" content="Our World in Data"/>
        {/*<meta name="citation_volume" content="271"/>
        <meta name="citation_issue" content="20"/>
        <meta name="citation_firstpage" content="11761"/>
        <meta name="citation_lastpage" content="11766"/>
        <meta name="citation_pdf_url" content="http://www.example.com/content/271/20/11761.full.pdf"/>*/}
    </React.Fragment>
}
