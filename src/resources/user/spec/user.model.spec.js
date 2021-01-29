import { User } from '../user.model'
import mongoose from 'mongoose'

describe('User model', () => {
  describe('schema', () => {

    test('email', () => {
      const status = User.schema.obj.email
      expect(status).toEqual({
        type: String,
        required: true,
        unique: true,
        trim: true
      })
    })

    test('name', () => {
      const name = User.schema.obj.name
      expect(name).toEqual({
        type: String,
        required: true,
        trim: true
      })
    })

    test('credit', () => {
      const credit = User.schema.obj.credit
      expect(credit).toEqual({
        type: Number,
        required: true,
        default: 0
      })
    })

    test('password', () => {
      const password = User.schema.obj.password
      expect(password).toEqual({
        type: String,
        required: true
      })
    })
  })
})