import * as settings from '../settings'
import * as React from 'react'

export const Head = (props: { pageTitle: string, pageDesc: string, canonicalUrl: string, imageUrl?: string }) => {
    const {pageTitle, pageDesc, canonicalUrl, imageUrl} = props
    return <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>{pageTitle} - Our World in Data</title>
        <meta name="description" content={pageDesc}/>
        <link rel="canonical" href={canonicalUrl}/>
        <meta property="fb:app_id" content="1149943818390250"/>
        <meta property="og:url" content={canonicalUrl}/>
        <meta property="og:title" content={pageTitle}/>
        <meta property="og:description" content={pageDesc}/>
        {imageUrl && <meta property="og:image" content={imageUrl}/>}
        <meta property="og:site_name" content="Our World in Data"/>
        {imageUrl && <meta name="twitter:card" content="summary_large_image"/>}
        <meta name="twitter:site" content="@OurWorldInData"/>
        <meta name="twitter:creator" content="@OurWorldInData"/>
        <meta name="twitter:title" content={pageTitle}/>
        <meta name="twitter:description" content={pageDesc}/>
        {imageUrl && <meta name="twitter:image" content={imageUrl}/>}
        <link rel="stylesheet" href={`${settings.STATIC_ROOT}/owid.css`}/>
    </head>
}
