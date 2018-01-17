import {GRAPHER_DIR, BAKED_DIR} from './settings'
import * as filenamify from 'filenamify'
import * as glob from 'glob'
import * as parseUrl from 'url-parse'
const exec = require('child-process-promise').exec
import * as path from 'path'
import * as _ from 'lodash'
import * as md5 from 'md5'

// Given a grapher url with query string, create a key to match export filenames
export function grapherUrlToFilekey(grapherUrl: string) {
    const url = parseUrl(grapherUrl)
    const slug = _.last(url.pathname.split('/')) as string
    const queryStr = url.query as any
    return `${slug}${queryStr ? "-"+md5(queryStr) : ""}`
}

interface ChartExportMeta {
    key: string
    svgUrl: string
    version: number
    width: number
    height: number
}

export interface GrapherExports {
    get: (grapherUrl: string) => ChartExportMeta
}

export async function bakeGrapherUrls(urls: string[]) {
    const args = [`${GRAPHER_DIR}/dist/src/bakeChartsToImages.js`]
    args.push(...urls)
    args.push(`${BAKED_DIR}/exports`)
    const promise = exec(`cd ${GRAPHER_DIR} && node ${args.map(arg => JSON.stringify(arg)).join(" ")}`)
    promise.childProcess.stdout.on('data', (data: any) => console.log(data.toString().trim()))
    await promise
}

export async function getGrapherExportsByUrl(): Promise<{ get: (grapherUrl: string) => ChartExportMeta }> {
    // Index the files to see what we have available, using the most recent version
    // if multiple exports exist
    const files = glob.sync(`${BAKED_DIR}/exports/*.svg`)
    const exportsByKey = new Map()
    for (const filepath of files) {
        const filename = path.basename(filepath)
        const [key, version, dims] = filename.split("_")
        const versionNumber = parseInt(version.split('v')[1])
        const [width, height] = dims.split("x")

        const current = exportsByKey.get(key)
        if (!current || current.version < versionNumber) {
            exportsByKey.set(key, {
                key: key,
                svgUrl: `/exports/${filename}`,
                version: versionNumber,
                width: parseInt(width),
                height: parseInt(height)
            })
        }
    }

    return {
        get(grapherUrl: string) {
            return exportsByKey.get(grapherUrlToFilekey(grapherUrl))
        }
    }
}