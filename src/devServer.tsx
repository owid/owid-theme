import {Router} from 'express'
import * as express from 'express'
import {renderFrontPage, renderPageBySlug, renderChartsPage} from './renderPage'
import {WORDPRESS_DIR} from './settings'

const beforeWebpack = Router()

beforeWebpack.get('/', async (req, res) => {
    res.send(await renderFrontPage())
})

beforeWebpack.get('/charts', async (req, res) => {
    res.send(await renderChartsPage())
})

const afterWebpack = Router()

afterWebpack.use(express.static(WORDPRESS_DIR))

afterWebpack.get('/:slug', async (req, res) => {
    res.send(await renderPageBySlug(req.params.slug))  
})

export { beforeWebpack, afterWebpack }
