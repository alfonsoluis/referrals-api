import config from '../config'
import mongoose from 'mongoose'
import { User } from '../resources/user/user.model'
import { Referral } from '../resources/referral/referral.model'
import jwt from 'jsonwebtoken'

export const newToken = (user) => {
  return jwt.sign({ id: user.id }, config.secrets.jwt, {
    expiresIn: config.secrets.jwtExp,
  })
}

export const verifyToken = (token) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

export const signup = async (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res
      .status(400)
      .send({ message: 'You need to provide a name, an email and a password' })
  }
  try {
    let referralStatus

    const user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send('User already registered.')

    const newUser = await User.create(req.body)
    const token = newToken(newUser)

    // If signing up with a referral
    if (req.body.referral) {
      if (mongoose.Types.ObjectId.isValid(req.body.referral)) {
        const referral = await Referral.findOne({ _id: req.body.referral })
        if (referral) {
          if (!referral.isActive) {
            referralStatus =
              'User created but no credit was granted because the referral used has expired'
          } else {
            const referralCreator = await User.findOne({
              _id: referral.createdBy,
            })
            newUser.credit += config.conversionPrice
            await newUser.save()
            referralStatus = `${config.conversionPrice}$ were added to ${newUser.name} for using a referral. Kudos to ${referralCreator.name} for sharing`
            const totalUserConverted = await referral.addConversion(newUser)
            if (totalUserConverted === 5) {
              referralCreator.credit += config.conversionPrice
              await referralCreator.save()
            }
          }
        } else {
          console.log('referral NOT found')
          referralStatus =
            'The referral used seems to be invalid. User created without a referral'
        }
      } else {
        referralStatus = 'User created, but the referral was invalid'
      }
    } else {
      return res.status(201).send({ token })
    }
    return res.status(201).send({ token, referralStatus })
  } catch (e) {
    throw e
    // return res.status(500).send(e)
  }
}

export const checkReferral = async (req, res) => {
  if (!req.query.id) {
    return res
      .status(400)
      .send({ message: 'You need to provide a referral id' })
  }
  try {
    const referral = await Referral.findOne({ _id: req.query.id })
    if (!referral.isActive) {
      return res.status(400).send({ message: 'The referral has expired' })
    }
    if (referral.isActive && referral.due < Date.now()) {
      referral.isActive = false
      await referral.save()
      return res.status(400).send({ message: 'The referral has expired' })
    }
    res.status(200).json({ referralId: req.query.id })
  } catch (e) {
    return res.status(500).send({
      message: `We could not find a Referral with the id: ${req.query.id}`,
    })
  }
}

export const signin = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .send({ message: 'You need to provide an email and a password' })
  }
  const invalid = {
    message: 'Please verify your email or password combination',
  }
  try {
    const user = await User.findOne({ email: req.body.email })
      .select('email password')
      .exec()
    if (!user) {
      return res.status(401).send(invalid)
    }
    const match = await user.checkPassword(req.body.password)
    if (!match) {
      return res.status(401).send(invalid)
    }
    const token = newToken(user)
    return res.status(201).send({ token })
  } catch (e) {
    console.error(e)
    res.status(500).end()
  }
}

export const protect = async (req, res, next) => {
  const bearer = req.headers.authorization

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).end()
  }

  const token = bearer.split('Bearer ')[1].trim()
  let payload

  try {
    payload = await verifyToken(token)
  } catch (e) {
    console.error(e)
    return res.status(401).end()
  }

  const user = await User.findById(payload.id).select('-password').lean().exec()

  if (!user) {
    return res.status(401).end()
  }

  req.user = user
  next()
}
