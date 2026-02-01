import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { reviewService } from '../review/review.service.js'
import { ObjectId } from 'mongodb'

export const userService = {
    add, // Create (Signup)
    getById, // Read (Profile page)
    update, // Update (Edit profile)
    remove, // Delete (remove user)
    query, // List (of users)
    getByUsername, // Used for Login
    queryOne,
    addTrip,
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('user')
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        var criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        const user = await collection.findOne(criteria)
        delete user.password

        criteria = { byUserId: userId }

        user.givenReviews = await reviewService.query(criteria)
        console.log(user.givenReviews)
        user.givenReviews = user.givenReviews.map(review => {
            delete review.byUser
            return review
        })

        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user')
        const user = await collection.findOne({ username })
        return user
    } catch (err) {
        logger.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const criteria = { _id: ObjectId.createFromHexString(userId) }

        const collection = await dbService.getCollection('user')
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
        const collection = await dbService.getCollection('user')

        const userEntity = await collection.findOne({ _id: ObjectId.createFromHexString(user._id) })
        if (!userEntity) throw new Error('User not found')

        const userToSave = {
            ...userEntity,
            firstName: user.firstName || userEntity.firstName,
            lastName: user.lastName || userEntity.lastName,
            fullname: (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : userEntity.fullname,
            email: user.email || userEntity.email,
            phone: user.phone || userEntity.phone,
            imgUrl: user.imgUrl || userEntity.imgUrl,
            birthDate: user.birthDate || userEntity.birthDate,
            saved: user.saved || userEntity.saved || [],
            score: user.score !== undefined ? user.score : userEntity.score,
            trips: user.trips || userEntity.trips || [],
        }

        await collection.updateOne(
            { _id: userToSave._id },
            { $set: userToSave }
        )

        const returnedUser = { ...userToSave }
        delete returnedUser.password
        return returnedUser

    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        const userToAdd = {
            email: user.email,
            phone: user.phone || '',
            password: user.password || '',
            firstName: user.firstName,
            lastName: user.lastName,
            fullname: `${user.firstName} ${user.lastName}`,
            birthDate: user.birthDate,
            imgUrl: user.imgUrl || '',
            isAdmin: user.isAdmin || false,
            score: 100,
            saved: [],
            trips: [],
        }
        const collection = await dbService.getCollection('user')
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            { email: txtCriteria },
            { firstName: txtCriteria },
            { lastName: txtCriteria },
            { fullname: txtCriteria },
            { phone: txtCriteria }
        ]
    }
    return criteria
}

async function queryOne({ email, phone }) {
    try {
        const collection = await dbService.getCollection('user')

        if (!email && !phone) return null
        const criteria = {
            $or: []
        }
        if (email) criteria.$or.push({ email })
        if (phone) criteria.$or.push({ phone })
        if (criteria.$or.length === 0) return null

        const user = await collection.findOne(criteria)
        return user
    } catch (err) {
        logger.error(`while finding user by email/phone`, err)
        throw err
    }
}


async function addTrip(userId, trip) {
    try {
        const collection = await dbService.getCollection('user')
        await collection.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { trips: trip } }
        )
    } catch (err) {
        logger.error(`cannot add trip to user ${userId}`, err)
        throw err
    }
}
