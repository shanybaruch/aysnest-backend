import { orderService } from './order.service.js'
import { logger } from '../../services/logger.service.js'

export async function getOrders(req, res) {
    try {
        const { loggedinUser } = req
        let filterBy = {}

        if (req.query.hostId) {
            filterBy.hostId = req.query.hostId
        }
        else if (req.query.buyerId) {
            filterBy['buyer._id'] = req.query.buyerId
        }
        const orders = await orderService.query(filterBy)
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

export async function updateOrder(req, res) {
    try {
        const order = req.body
        const updatedOrder = await orderService.update(order)
        res.json(updatedOrder)
    } catch (err) {
        logger.error('Failed to update order', err)
        res.status(400).send({ err: 'Failed to update order' })
    }
}