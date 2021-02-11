import { user } from '../user.controllers'
import mongoose from 'mongoose'

describe('user controllers:', () => {
  test('has user (getUser) methods', async () => {
    expect.assertions(2)

    const u = mongoose.Types.ObjectId()
    const req = {
      user: u,
    }

    const res = {
      status(status) {
        expect(status).toBe(200)
        return this
      },
      json(result) {
        expect(result.data).toBe(u)
      },
    }

    await user(req, res)
  })
})
