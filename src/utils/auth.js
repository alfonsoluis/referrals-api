
import config from '../config'
import { User } from '../resources/user/user.model'
import { Referral } from '../resources/referral/referral.model'
import jwt from 'jsonwebtoken'
import { convertCompilerOptionsFromJson, isRegularExpressionLiteral } from 'typescript'

export const newToken = user => {
  return jwt.sign(
    { id: user.id }, 
    config.secrets.jwt, 
    { expiresIn: config.secrets.jwtExp }
  )
}

export const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

export const signup = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'You need to provide an email and a password' })
  }
  try {
    let referralStatus = 'User created without a referral link'
    
    const user = await User.findOne({ email: req.body.email })
    if (user) return res.status(400).send("User already registered.")
    
    const newUser = await User.create(req.body)
    const token = newToken(newUser)

    // If signing up with a referral
    if(req.body.referral){
      
      const referral = await Referral.findOne({ _id: req.body.referral })
      
      if(!referral.isActive) {
        referralStatus = 'No credit was granted because the referral has expired'
      } else {

        const referralCreator = await User.findOne({ _id: referral.createdBy})
        newUser.credit += config.convertionPrice
        newUser.save()

        referralStatus = `${config.convertionPrice}$ were added to ${newUser.name} for using a referral. Kudos to ${referralCreator.name} for sharing`
        const totalUserConverted = await referral.addConvertion(newUser)
        console.log("Valid referral: ", referral, config.convertionPrice);
        
        if(totalUserConverted === 5) {
          referralCreator.credit += config.convertionPrice
          referralCreator.save()
        }
      }
    }

    return res.status(201).send({ token, referralStatus })

  } catch (e) {
    return res.status(500).send(e)
  }
}

export const checkReferral = async (req, res) => {
  if (!req.query.id) {
    return res.status(400).send({ message: 'You need to provide a referral id' })
  }
  try {
    let referral = await Referral.findOne({ _id: req.query.id })
    if(!referral.isActive) {
      return res.status(400).send({ message: 'The referral has expired' })
    }
    if(referral.isActive && referral.due < Date.now()) {
      referral.isActive = false
      await referral.save()
      return res.status(400).send({ message: 'The referral has expired' })
    }
    res.status(200).json({ referralId: req.query.id })
  } catch (e) {
    return res.status(500).send({ message: `We could not find a Referral with the id: ${req.query.id}` })
  }
}

export const signin = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ message: 'You need to provide an email and a password' })
  }
  const invalid = { message: 'Please verify your email or password combination' }
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
    console.error(e);
    return res.status(401).end()
  }

  const user = await User.findById(payload.id)
    .select('-password')
    .lean()
    .exec()

  if (!user) {
    return res.status(401).end()
  }

  req.user = user
  next()
}