import { Referral } from '../referral.model'
import mongoose from 'mongoose'

describe('Referral model', () => {
  describe('schema', () => {

    test('status', () => {
      const status = Referral.schema.obj.status
      expect(status).toEqual({
        type: Boolean,
        required: true,
        default: 'true'
      })
    })

    test('due', () => {
      const due = Referral.schema.obj.due
      expect(due).toEqual(Date)
    })

    test('createdBy', () => {
      const createdBy = Referral.schema.obj.createdBy
      expect(createdBy).toEqual({
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
        required: true
      })
    })
  })
})