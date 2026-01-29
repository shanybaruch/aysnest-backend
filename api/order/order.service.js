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
        const orderToSave = {
            status: order.status
        }
        const collection = await dbService.getCollection('order')
        await collection.updateOne(
            { _id: new ObjectId(order._id) },
            { $set: orderToSave }
        )
        return order
    } catch (err) {
        logger.error(`cannot update order ${order._id}`, err)
        throw err
    }
}