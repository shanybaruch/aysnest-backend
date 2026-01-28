import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { ObjectId } from 'mongodb'

export const orderService = {
    add,
    query,
    update,
}

// async function add(order) {
//     try {
//         const collection = await dbService.getCollection('order') 
//         await collection.insertOne(order)
//         return order
//     } catch (err) {
//         logger.error('cannot insert order', err)
//         throw err
//     }
// }
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

async function update(user) {
    try {
        const userToSave = {
            _id: ObjectId(user._id),
            fullname: user.fullname,
            imgUrl: user.imgUrl,
            trips: user.trips || [] 
        }
        const collection = await dbService.getCollection('user')
        await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
        return userToSave
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}