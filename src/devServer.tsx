import {Router} from 'express'
import {renderFrontPage, renderPageBySlug, renderChartsPage} from './renderPage'

const devServer = Router()

devServer.get('/', async (req, res) => {
    res.send(await renderFrontPage())
})

devServer.get('/charts', async (req, res) => {
    res.send(await renderChartsPage())
})

devServer.get('/:slug', async (req, res) => {
    res.send(await renderPageBySlug(req.params.slug))  
})

export { devServer }
