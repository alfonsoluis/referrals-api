import { newToken, verifyToken, signup, signin, protect } from '../auth'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import config from '../../config'
import { User } from '../../resources/user/user.model'
import { Referral } from '../../../dist/resources/referral/referral.model'

describe('Authentication:', () => {
  describe('newToken', () => {
    test('creates new jwt from user', () => {
      const id = 123
      const token = newToken({ id })
      const user = jwt.verify(token, config.secrets.jwt)

      expect(user.id).toBe(id)
    })
  })

  describe('verifyToken', () => {
    test('validates jwt and returns payload', async () => {
      const id = 1234
      const token = jwt.sign({ id }, config.secrets.jwt)
      const user = await verifyToken(token)
      expect(user.id).toBe(id)
    })
  })

  describe('signup', () => {
    test('requires name, email and password', async () => {
      expect.assertions(2)
      const req = { body: {} }
      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        },
      }
      await signup(req, res)
    })

    test('creates user and sends new token from user', async () => {
      expect.assertions(2)

      const req = {
        body: {
          name: 'Alfonso Rodriguez',
          email: 'alfonsoluis@gmail.com',
          password: 'dumbpassword',
        },
      }
      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        async send(result) {
          let user = await verifyToken(result.token)
          user = await User.findById(user.id).lean().exec()
          expect(user.email).toBe('alfonsoluis@gmail.com')
        },
      }

      await signup(req, res)
    })

    test('Creates user with referral', async () => {
      expect.assertions(2)

      const userFields = {
        name: 'Alfonso Rodriguez',
        email: 'alfonsoluis@gmail.comm',
        password: 'dumbpassword',
      }
      const newUser = await User.create(userFields)

      const referralFields = {
        user: newUser,
      }
      const referral = await Referral.create(referralFields)

      const req = {
        body: {
          name: 'Pedro Gonzalez',
          email: 'pedro@gmail.com',
          password: 'dumbpassword',
          referral: referral._id.toString(),
        },
      }
      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        async send(result) {
          expect(result.referralStatus).toBe(
            `${config.conversionPrice}$ were added to ${req.body.name} for using a referral. Kudos to ${userFields.name} for sharing`
          )
        },
      }

      await signup(req, res)
    })
  })

  describe('signin', () => {
    test('requires email and password', async () => {
      expect.assertions(2)

      const req = { body: {} }
      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        },
      }

      await signin(req, res)
    })

    test('user must be real', async () => {
      expect.assertions(2)

      const req = {
        body: {
          name: 'Alfonso Rodriguez',
          email: 'alfonsoluis@gmail.com',
          password: 'dunbpassword',
        },
      }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        },
      }

      await signin(req, res)
    })

    test('passwords must match', async () => {
      expect.assertions(2)

      await User.create({
        name: 'Alfonso Rodriguez',
        email: 'alfonsoluis@gmail.com',
        password: 'dumbpassword',
      })

      const req = {
        body: {
          name: 'Alfonso Rodriguez',
          email: 'alfonsoluis@gmail.com',
          password: 'wrongpassword',
        },
      }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        send(result) {
          expect(typeof result.message).toBe('string')
        },
      }

      await signin(req, res)
    })

    test('creates new token', async () => {
      expect.assertions(2)
      const fields = {
        name: 'Alfonso Rodriguez',
        email: 'alfonsoluis@gmail.comm',
        password: 'dumbpassword',
      }
      const savedUser = await User.create(fields)

      const req = { body: fields }
      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        async send(result) {
          let user = await verifyToken(result.token)
          user = await User.findById(user.id).lean().exec()
          expect(user._id.toString()).toBe(savedUser._id.toString())
        },
      }

      await signin(req, res)
    })
  })

  describe('protect', () => {
    test('looks for Bearer token in headers', async () => {
      expect.assertions(2)

      const req = { headers: {} }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        },
      }

      await protect(req, res)
    })

    test('token must have correct prefix', async () => {
      expect.assertions(2)

      const req = { headers: { authorization: newToken({ id: '123sfkj' }) } }
      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        },
      }

      await protect(req, res)
    })

    test('must be a real user', async () => {
      const token = `Bearer ${newToken({ id: mongoose.Types.ObjectId() })}`
      const req = { headers: { authorization: token } }

      const res = {
        status(status) {
          expect(status).toBe(401)
          return this
        },
        end() {
          expect(true).toBe(true)
        },
      }

      await protect(req, res)
    })

    test('finds user form token and passes on', async () => {
      const user = await User.create({
        name: 'Alfonso Rodriguez',
        email: 'alfonsoluis@gmail.com.com',
        password: '1234',
      })
      const token = `Bearer ${newToken(user)}`
      const req = { headers: { authorization: token } }

      const next = () => {}
      await protect(req, {}, next)
      expect(req.user._id.toString()).toBe(user._id.toString())
      expect(req.user).not.toHaveProperty('password')
    })
  })
})
