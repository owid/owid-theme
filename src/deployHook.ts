import {WordpressBaker} from './WordpressBaker'
import * as parseArgs from 'minimist'
import * as os from 'os'
import * as path from 'path'
const argv = parseArgs(process.argv.slice(2))

async function main(database: string, wordpressUrl: string, wordpressDir: string) {
    try {
        const baker = new WordpressBaker({
            database: database,
            wordpressUrl: wordpressUrl,
            wordpressDir: wordpressDir,
            outDir: os.homedir() === "/var/www" ? '/home/owid/wp-static' : path.join(os.homedir(), 'wp-static')
        })

        await baker.bakeAll()
        await baker.deploy(`Code deployment update`)
        baker.end()
    } catch (err) {
        console.error(err)
    }
}

main(argv._[0], argv._[1], argv._[2])