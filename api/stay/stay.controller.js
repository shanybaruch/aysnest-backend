import { logger } from '../../services/logger.service.js'
import { stayService } from './stay.service.js'

export async function getStays(req, res) {
	try {
		const filterBy = {
			txt: req.query.txt || '',
			minCapacity: req.query.minCapacity || 0,
			from: req.query.from || null,
			to: req.query.to || null,
			hostId: req.query.hostId || ''
		}
		const stays = await stayService.query(filterBy)
		res.json(stays)
	} catch (err) {
		res.status(500).send({ err: 'Failed to get stays' })
	}
}

export async function getStayById(req, res) {
	try {
		const stayId = req.params.id
		const stay = await stayService.getById(stayId)
		res.json(stay)
	} catch (err) {
		logger.error('Failed to get stay', err)
		res.status(400).send({ err: 'Failed to get stay' })
	}
}

export async function addStay(req, res) {
	const { loggedinUser, body } = req

	try {
		const stay = {
			...body,
			host: {
				_id: loggedinUser._id,
				fullname: loggedinUser.fullname,
				imgUrl: loggedinUser.imgUrl
			},
			msgs: [],
			reviewsAvg: 0
		}

		const addedStay = await stayService.add(stay)
		res.json(addedStay)
	} catch (err) {
		logger.error('Failed to add stay', err)
		res.status(400).send({ err: 'Failed to add stay' })
	}
}

export async function updateStay(req, res) {
	const { loggedinUser, body: stay } = req
	const { _id: userId, isAdmin } = loggedinUser

	if (!isAdmin && stay.host._id !== userId) {
		res.status(403).send('Not your stay...')
		return
	}

	try {
		const updatedStay = await stayService.update(stay)
		res.json(updatedStay)
	} catch (err) {
		logger.error('Failed to update stay', err)
		res.status(400).send({ err: 'Failed to update stay' })
	}
}

export async function removeStay(req, res) {
	try {
		const stayId = req.params.id
		const removedId = await stayService.remove(stayId)

		res.send(removedId)
	} catch (err) {
		logger.error('Failed to remove stay', err)
		res.status(400).send({ err: 'Failed to remove stay' })
	}
}

export async function addStayMsg(stayId, msg) {
	try {
		const criteria = { _id: ObjectId.createFromHexString(stayId) }
		msg.id = makeId()
		msg.createdAt = Date.now()

		const collection = await dbService.getCollection('stay')

		await collection.updateOne(criteria, { $push: { msgs: msg } })

		const stay = await getById(stayId)
		if (stay.msgs && stay.msgs.length > 0) {
			const totalRate = stay.msgs.reduce((acc, m) => acc + (m.rate || 0), 0)
			const avgRate = (totalRate / stay.msgs.length).toFixed(2)

			await collection.updateOne(criteria, { $set: { reviewsAvg: +avgRate } })
			msg.newAvg = +avgRate
		}

		return msg
	} catch (err) {
		logger.error(`cannot add stay msg ${stayId}`, err)
		throw err
	}
}

export async function removeStayMsg(req, res) {
	try {
		const { id: stayId, msgId } = req.params

		const removedId = await stayService.removeStayMsg(stayId, msgId)
		res.send(removedId)
	} catch (err) {
		logger.error('Failed to remove stay msg', err)
		res.status(400).send({ err: 'Failed to remove stay msg' })
	}
}
