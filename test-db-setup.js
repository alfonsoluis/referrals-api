import mongoose from 'mongoose'
import cuid from 'cuid'
import _ from 'lodash'
import config from './src/config'
import { User } from './src/resources/user/user.model'

const models = { User }

const url = process.env.MONGODB_URI || process.env.DB_URL || config.dbUrl

global.newId = () => {
  return mongoose.Types.ObjectId()
}

const remove = (collection) =>
  new Promise((resolve, reject) => {
    collection.deleteMany((err) => {
      if (err) return reject(err)
      resolve()
    })
  })

// eslint-disable-next-line jest/no-done-callback
beforeEach(async (done) => {
  const db = cuid()
  function clearDB() {
    return Promise.all(_.map(mongoose.connection.collections, (c) => remove(c)))
  }

  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(url + db, {
        useNewUrlParser: true,
        autoIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      })
      await clearDB()
      await Promise.all(Object.keys(models).map((name) => models[name].init()))
    } catch (e) {
      console.log('connection error')
      console.error(e)
      throw e
    }
  } else {
    await clearDB()
  }
  done()
})
// eslint-disable-next-line jest/no-done-callback
afterEach(async (done) => {
  await mongoose.connection.db.dropDatabase()
  await mongoose.disconnect()
  return done()
})
afterAll((done) => {
  return done()
})
