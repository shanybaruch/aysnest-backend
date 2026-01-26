import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const orderService = {
    add,
    query,
}

async function add(order) {
    try {
        const collection = await dbService.getCollection('order') // כאן נוצר ה-Collection
        await collection.insertOne(order)
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