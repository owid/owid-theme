import {WordpressBaker} from './WordpressBaker'


async function main() {
    const baker = new WordpressBaker({
        database: "owid_wordpress",
        wordpressUrl: "http://l:8080",
        outDir: "/Users/mispy/wp-static"
    })

    baker.bakeAll()
    baker.end()
}

main()