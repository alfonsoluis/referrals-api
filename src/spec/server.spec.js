import request from 'supertest'
import { app } from '../server'
import { User } from '../resources/user/user.model'
import { newToken } from '../utils/auth'
import mongoose from 'mongoose'

describe('API Authentication:', () => {
  let token
  beforeEach(async () => {
    const user = await User.create({ 
        name: 'foncho',
        email: 'alfonsoluis@gmail.com', 
        password: 'dumbpassword' 
    })
    token = newToken(user)
  })

  describe('API authentication', () => {

    test('API should be inaccesible without a JWT', async () => {
      let response = await request(app).get('/api/referral')
      expect(response.statusCode).toBe(401)

      response = await request(app).get('/api/convertion')
      expect(response.statusCode).toBe(401)

      response = await request(app).get('/api/user')
      expect(response.statusCode).toBe(401)
    })

    test('API should be accessible with JWT', async () => {
      const jwt = `Bearer ${token}`
      const id = mongoose.Types.ObjectId()
      const results = await Promise.all([
        request(app)
          .get('/api/user')
          .set('Authorization', jwt),
        request(app)
          .get(`/api/user/${id}`)
          .set('Authorization', jwt),
        request(app)
          .post('/api/user')
          .set('Authorization', jwt),
        request(app)
          .put(`/api/user/${id}`)
          .set('Authorization', jwt),
        request(app)
          .delete(`/api/user/${id}`)
          .set('Authorization', jwt)
      ])

      results.forEach(res => expect(res.statusCode).not.toBe(401))
    })
  })
})