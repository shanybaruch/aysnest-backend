import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { getOrders, addOrder } from './order.controller.js'

const router = express.Router()

router.get('/', requireAuth, getOrders)
router.post('/', requireAuth, addOrder)

export const orderRoutes = router