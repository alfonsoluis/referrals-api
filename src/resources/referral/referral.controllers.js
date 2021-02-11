import config from '../../config'
import { crudControllers } from '../../utils/crud'
import { Referral } from './referral.model'

export default {
  ...crudControllers(Referral),
  create: async (req, res) => {
    const createdBy = req.user._id
    const today = new Date()
    const due = today.setDate(today.getDate() + config.referralLifespan)
    try {
      const referral = await Referral.create({
        createdBy,
        due,
        conversions: [],
      })

      res.status(201).json({
        data: referral,
        link: `http${config.SSLEnabled ? 's' : ''}://${config.baseUrl}:${
          !config.isProd ? config.port : ''
        }/checkReferral?id=${referral._id}`,
      })
    } catch (e) {
      console.error(e)
      res.status(400).end()
    }
  },
}
