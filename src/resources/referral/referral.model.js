import mongoose from 'mongoose'
import { convertionSchema, Convertion } from './convertion.model'

const referralSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      required: true,
      default: true
    },
    due: Date,
    convertions: [ convertionSchema ],
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { timestamps: true }
)

referralSchema.index({ _id: "hashed", createdBy: 1 }, { unique: true })

referralSchema.methods.addConvertion = async function(user) {
  try {
    const convertion = await Convertion.create({createdBy: user._id})
    this.convertions.push(convertion)
    this.save()
    return this.convertions.length
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

export const Referral = mongoose.model('referral', referralSchema)