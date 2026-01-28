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

async function login(credentials) {
	const { email, phone, password } = credentials

	const user = await userService.queryOne({ email, phone })
	if (!user) return Promise.reject('Invalid credentials')

	const isMatch = await bcrypt.compare(password, user.password)
	if (!isMatch) return Promise.reject('Invalid credentials')

	const userToReturn = { ...user }
	delete userToReturn.password
	return userToReturn
}

async function signup(userToSignup) {
	const { email, phone, firstName, lastName, birthDate, password } = userToSignup
	const saltRounds = 10
	logger.debug(`auth.service - signup for: ${firstName} ${lastName}`)

	if (!email || !firstName || !lastName || !password) {
		return Promise.reject('Missing required signup information')
	}

	const userExist = await userService.queryOne({ email, phone })
	if (userExist) return Promise.reject('User already exists')

	const hash = await bcrypt.hash(password, saltRounds)
	const fullname = `${firstName} ${lastName}`

	return userService.add({
		email,
		phone,
		firstName,
		lastName,
		password: hash,
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