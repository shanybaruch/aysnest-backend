import { orderService } from './order.service.js'
import { logger } from '../../services/logger.service.js'

export async function getOrders(req, res) {
    try {
        const { loggedinUser } = req
        let filterBy = {}
        if (!loggedinUser.isAdmin) {
            filterBy = { 'buyer._id': loggedinUser._id }
        }
        const orders = await orderService.query(req.query)
        res.json(orders)
    } catch (err) {
        logger.error('Failed to get orders', err)
        res.status(400).send({ err: 'Failed to get orders' })
    }
}

export async function addOrder(req, res) {
    const { loggedinUser } = req
    try {
        const order = req.body
        order.buyer._id = loggedinUser._id

        const addedOrder = await orderService.add(order)
        res.json(addedOrder)
    } catch (err) {
        logger.error('Failed to add order', err)
        res.status(400).send({ err: 'Failed to add order' })
    }
}