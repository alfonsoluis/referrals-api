import mongoose from 'mongoose'
import { conversionSchema, Conversion } from './conversion.model'

const referralSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    due: Date,
    conversions: [conversionSchema],
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { timestamps: true }
)

referralSchema.index({ _id: 'hashed', createdBy: 1 }, { unique: true })

referralSchema.methods.addConversion = async function(user) {
  try {
    const conversion = await Conversion.create({ createdBy: user._id })
    this.conversions.push(conversion)
    this.save()
    return this.conversions.length
  } catch (e) {
    console.error(e)
  }
}

// export const Referral = mongoose.model('referral', referralSchema)

export const Referral =
  mongoose.models.referral || mongoose.model('referral', referralSchema)
