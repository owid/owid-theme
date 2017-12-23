import {createConnection} from './database'
import * as settings from './settings'

export const wpdb = createConnection({
    database: settings.WORDPRESS_DB_NAME as string
})
