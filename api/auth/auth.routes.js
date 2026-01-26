import express from 'express'

import { login, signup, logout, checkUser } from './auth.controller.js'

const router = express.Router()

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)
router.get('/check', checkUser)

export const authRoutes = router