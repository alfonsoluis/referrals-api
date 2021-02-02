import { getOne, getMany, createOne, updateOne, removeOne } from '../crud'
import { Referral } from '../../resources/referral/referral.model'
import mongoose from 'mongoose'

describe('crud controllers', () => {
  describe('getOne', () => {
    test('finds by authenticated user and id', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const referral = await Referral.create({ createdBy: user })

      const req = {
        params: {
          id: referral._id,
        },
        user: {
          _id: user,
        },
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(result) {
          expect(result.data._id.toString()).toBe(referral._id.toString())
        },
      }

      await getOne(Referral)(req, res)
    })

    test('404 if no doc was found', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()

      const req = {
        params: {
          id: mongoose.Types.ObjectId(),
        },
        user: {
          _id: user,
        },
      }

      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        end() {
          expect(true).toBe(true)
        },
      }

      await getOne(Referral)(req, res)
    })
  })

  describe('getMany', () => {
    test('finds array of docs by authenticated user', async () => {
      expect.assertions(4)

      const user = mongoose.Types.ObjectId()
      await Referral.create([
        { createdBy: user },
        { createdBy: user },
        { createdBy: mongoose.Types.ObjectId() },
      ])

      const req = {
        user: {
          _id: user,
        },
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(result) {
          expect(result.data).toHaveLength(2)
          result.data.forEach((doc) =>
            expect(`${doc.createdBy}`).toBe(`${user}`)
          )
        },
      }

      await getMany(Referral)(req, res)
    })
  })

  describe('createOne', () => {
    test('creates a new doc', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const body = { user: user }

      const req = {
        user: { _id: user },
        body,
      }

      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        json(results) {
          expect(results.data.createdBy).toBe(body.user)
        },
      }

      await createOne(Referral)(req, res)
    })

    test('createdBy should be the authenticated user', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const body = { name: 'name' }

      const req = {
        user: { _id: user },
        body,
      }

      const res = {
        status(status) {
          expect(status).toBe(201)
          return this
        },
        json(results) {
          expect(`${results.data.createdBy}`).toBe(`${user}`)
        },
      }

      await createOne(Referral)(req, res)
    })
  })

  describe('updateOne', () => {
    test('finds doc by authenticated user and id to update', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const referral = await Referral.create({ createdBy: user })
      const update = { createdBy: user }

      const req = {
        params: { id: referral._id },
        user: { _id: user },
        body: update,
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(results) {
          expect(results.data.createdBy).toStrictEqual(user)
        },
      }

      await updateOne(Referral)(req, res)
    })

    test('400 if no doc', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const update = { name: 'hello' }

      const req = {
        params: { id: mongoose.Types.ObjectId() },
        user: { _id: user },
        body: update,
      }

      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        end() {
          expect(true).toBe(true)
        },
      }

      await updateOne(Referral)(req, res)
    })
  })

  describe('removeOne', () => {
    test('first doc by authenticated user and id to remove', async () => {
      expect.assertions(2)

      const user = mongoose.Types.ObjectId()
      const referral = await Referral.create({ name: 'name', createdBy: user })

      const req = {
        params: { id: referral._id },
        user: { _id: user },
      }

      const res = {
        status(status) {
          expect(status).toBe(200)
          return this
        },
        json(results) {
          expect(`${results.data._id}`).toBe(`${referral._id}`)
        },
      }

      await removeOne(Referral)(req, res)
    })

    test('400 if no doc', async () => {
      expect.assertions(2)
      const user = mongoose.Types.ObjectId()

      const req = {
        params: { id: mongoose.Types.ObjectId() },
        user: { _id: user },
      }

      const res = {
        status(status) {
          expect(status).toBe(400)
          return this
        },
        end() {
          expect(true).toBe(true)
        },
      }

      await removeOne(Referral)(req, res)
    })
  })
})
