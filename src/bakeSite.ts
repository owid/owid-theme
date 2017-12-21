import {WordpressBaker} from './WordpressBaker'

async function main() {
    const baker = new WordpressBaker({
        database: "owid_wordpress",
        wordpressUrl: "http://l:8080",
        wordpressDir: "/Users/mispy/ourworldindata.org",
        outDir: "/Users/mispy/wp-static"
    })

    await baker.bakeAll()
    await baker.deploy()
    baker.end()
}

main()