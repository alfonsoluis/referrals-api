import express from 'express'
import { json, urlencoded } from 'body-parser'
import morgan from 'morgan'
import config from './config'
import cors from 'cors'
import { signup, checkReferral, signin, protect } from './utils/auth.js'
import { connect } from './utils/db'
import userRouter from './resources/user/user.router'
import referralRouter from './resources/referral/referral.router'
// import convertionRouter from './resources/convertion/convertion.router'

export const app = express()

app.disable('x-powered-by')

app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(morgan('dev'))

app.post('/signup', signup)
app.get('/checkReferral', checkReferral)
app.post('/signin', signin)

app.use('/api', protect)
app.use('/api/users', userRouter)
app.use('/api/referrals', referralRouter)
// app.use('/api/convertions', convertionRouter)

export const start = async () => {
  try {
    await connect()
    app.listen(config.port, () => {
      console.log(`⚡️⚡️ REST API is running on http://localhost:${config.port}/api`)
    })
  } catch (e) {
    console.error(e)
  }
}