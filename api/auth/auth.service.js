import Cryptr from 'cryptr'
import bcrypt from 'bcrypt'

import { userService } from '../user/user.service.js'
import { logger } from '../../services/logger.service.js'

const cryptr = new Cryptr(process.env.SECRET || 'Secret-Puk-1234')

export const authService = {
	signup,
	login,
	getLoginToken,
	validateToken,
	checkExists,
}

// async function login(username, password) {
// 	logger.debug(`auth.service - login with username: ${username}`)

// 	const user = await userService.getByUsername(username)
// 	if (!user) return Promise.reject('Invalid username or password')

// 	delete user.password
// 	user._id = user._id.toString()
// 	return user
// }

// async function signup({ username, password, fullname, imgUrl, isAdmin }) {
// 	const saltRounds = 10

// 	logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
// 	if (!username || !password || !fullname) return Promise.reject('Missing required signup information')

// 	const userExist = await userService.getByUsername(username)
// 	if (userExist) return Promise.reject('Username already taken')

// 	const hash = await bcrypt.hash(password, saltRounds)
// 	return userService.add({ username, password: hash, fullname, imgUrl, isAdmin })
// }
async function login(credentials) {
	const { email, phone } = credentials
	logger.debug(`auth.service - login with email: ${email} or phone: ${phone}`)

	const user = await userService.queryOne({ email, phone })
	if (!user) return Promise.reject('Invalid credentials')


	delete user.password
	user._id = user._id.toString()
	return user
}

async function signup(userToSignup) {
	const { email, phone, firstName, lastName, birthDate } = userToSignup

	logger.debug(`auth.service - signup for: ${firstName} ${lastName}`)

	if (!email || !firstName || !lastName) {
		return Promise.reject('Missing required signup information')
	}

	const userExist = await userService.queryOne({ email, phone })
	if (userExist) return Promise.reject('User already exists')

	const fullname = `${firstName} ${lastName}`

	return userService.add({
		email,
		phone,
		firstName,
		lastName,
		fullname,
		birthDate,
		imgUrl: userToSignup.imgUrl || '',
		isAdmin: false
	})
}

function getLoginToken(user) {
	const userInfo = {
		_id: user._id,
		fullname: user.fullname,
		score: user.score,
		isAdmin: user.isAdmin,
	}
	return cryptr.encrypt(JSON.stringify(userInfo))
}

function validateToken(loginToken) {
	try {
		const json = cryptr.decrypt(loginToken)
		const loggedinUser = JSON.parse(json)
		return loggedinUser
	} catch (err) {
		console.log('Invalid login token')
	}
	return null
}

async function checkExists(identifier) {
    const user = await userService.queryOne({ email: identifier, phone: identifier })
    return user
}