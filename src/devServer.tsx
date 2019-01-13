import {Router} from 'express'
import {renderFrontPage, renderPageBySlug, renderChartsPage} from './renderPage'

const beforeWebpack = Router()

beforeWebpack.get('/', async (req, res) => {
    res.send(await renderFrontPage())
})

beforeWebpack.get('/charts', async (req, res) => {
    res.send(await renderChartsPage())
})

const afterWebpack = Router()

afterWebpack.get('/:slug', async (req, res) => {
    res.send(await renderPageBySlug(req.params.slug))  
})

export { beforeWebpack, afterWebpack }
