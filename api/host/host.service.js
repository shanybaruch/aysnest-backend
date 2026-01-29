import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

export const hostService = {
    query,
    add,
}

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        
        const collection = await dbService.getCollection('host')
        const hosts = await collection.find(criteria).toArray()
        
        return hosts
    } catch (err) {
        logger.error('cannot find hosts', err)
        throw err
    }
}

async function add(host) {
    try {
        const collection = await dbService.getCollection('host')
        await collection.insertOne(host)
        return host
    } catch (err) {
        logger.error('cannot insert host', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}

    if (filterBy.ownerId) {
        criteria['owner._id'] = filterBy.ownerId
    }

    // if (filterBy.txt) {
    //     criteria.name = { $regex: filterBy.txt, $options: 'i' }
    // }

    return criteria
}