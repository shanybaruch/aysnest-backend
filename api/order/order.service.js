import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const orderService = {
    add,
    query,
    update,
}


async function add(order) {
    try {
        const collection = await dbService.getCollection('order')
        const result = await collection.insertOne(order)
        order._id = result.insertedId
        return order
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

async function query(filterBy = {}) {
    try {
        const collection = await dbService.getCollection('order')
        const orders = await collection.find(filterBy).toArray()
        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

async function update(order) {
    try {
        const orderCollection = await dbService.getCollection('order')
        const orderId = new ObjectId(order._id)

        await orderCollection.updateOne(
            { _id: orderId },
            { $set: { status: order.status } }
        )

        const userCollection = await dbService.getCollection('user')
        await userCollection.updateOne(
            { "trips._id": order._id },
            { $set: { "trips.$.status": order.status } }
        )

        return order
    } catch (err) {
        logger.error(`cannot update order ${order._id}`, err)
        throw err
    }
}