import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { addHost, getHosts } from './host.controller.js'

const router = express.Router()

router.get('/', requireAuth, getHosts)
router.post('/', requireAuth, addHost)

export const hostRoutes = router