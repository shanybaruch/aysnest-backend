import { hostService } from './host.service.js'
import { logger } from '../../services/logger.service.js'

export async function getHosts(req, res) {
    try {
        const { loggedinUser } = req
        let filterBy = { ...req.query }

        if (!loggedinUser.isAdmin) {
            filterBy.ownerId = loggedinUser._id
        }

        const hosts = await hostService.query(filterBy) 
        res.json(hosts)
    } catch (err) {
        logger.error('Failed to get hosts', err)
        res.status(400).send({ err: 'Failed to get hosts' })
    }
}

export async function addHost(req, res) {
    const { loggedinUser } = req
    try {
        const host = req.body
        host.owner = {
            _id: loggedinUser._id,
            fullname: loggedinUser.fullname,
            imgUrl: loggedinUser.imgUrl
        }

        const addedhost = await hostService.add(host)
        res.json(addedhost)
    } catch (err) {
        logger.error('Failed to add host', err)
        res.status(400).send({ err: 'Failed to add host' })
    }
}