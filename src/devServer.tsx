import {Router} from 'express'
import {renderFrontPage} from './renderPage'

const devServer = Router()

devServer.get('/', async (req, res) => {
    res.send(await renderFrontPage())
})

export { devServer }
