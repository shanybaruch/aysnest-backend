import http from 'http'
import path from 'path'
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'

import { logger } from './services/logger.service.js'
import { authRoutes } from './api/auth/auth.routes.js'
import { userRoutes } from './api/user/user.routes.js'
import { reviewRoutes } from './api/review/review.routes.js'
import { stayRoutes } from './api/stay/stay.routes.js'
import { orderRoutes } from './api/order/order.routes.js'
import { setupSocketAPI } from './services/socket.service.js'

import { setupAsyncLocalStorage } from './middlewares/setupAls.middleware.js'
import { hostRoutes } from './api/host/host.routes.js'

const app = express()
const server = http.createServer(app)

app.use(cookieParser())
app.use(express.json())

const corsOptions = {
    origin: [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
        'https://aysnest-frontend-react.onrender.com' 
    ],
    credentials: true
}
app.use(cors(corsOptions))

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('public')))
}

// app.all('*all', setupAsyncLocalStorage)
app.use(setupAsyncLocalStorage)

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/stay', stayRoutes)
app.use('/api/order', orderRoutes)
app.use('/api/host', hostRoutes)

setupSocketAPI(server)

app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const port = process.env.PORT || 3030

server.listen(port, () => {
    logger.info('Server is running on port: ' + port)
})