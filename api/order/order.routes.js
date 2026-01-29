import express from 'express'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { getOrders, addOrder, updateOrder } from './order.controller.js'

const router = express.Router()

router.get('/', requireAuth, getOrders)
router.post('/', requireAuth, addOrder)
router.put('/:id', requireAuth, updateOrder)

export const orderRoutes = router