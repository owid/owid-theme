require('module-alias').addAliases({
    'react'  : 'preact-compat',
    'react-dom': 'preact-compat'
})

require('dotenv').config()

interface Settings {
    STATIC_ROOT: string
    WORDPRESS_URL: string
    WORDPRESS_DB_NAME: string
    WORDPRESS_DIR: string
    GRAPHER_DIR: string

    // The output directory for static bundle
    BAKED_DIR: string
    // The root url to use in the static bundle output
    BAKED_URL: string

    // Are we currently baking a static bundle?
    IS_BAKING: boolean

    HTTPS_ONLY: boolean

    BLOG_POSTS_PER_PAGE: number
}

const env: Settings = (process.env as any)
env.BLOG_POSTS_PER_PAGE = 21
export = env