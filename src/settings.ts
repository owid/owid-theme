require('module-alias').addAliases({
    'react'  : 'preact-compat',
    'react-dom': 'preact-compat'
})

require('dotenv').config()

interface Settings {
    STATIC_ROOT: string
    WORDPRESS_URL: string
    WORDPRESS_DB_NAME: string

    // The root url to use in the static bundle output
    BAKED_URL: string

    // Are we currently baking a static bundle?
    IS_BAKING: boolean

    HTTPS_ONLY: boolean
}

const env: Settings = (process.env as any)
export = env