import mongoose from 'mongoose'

export const convertionSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { timestamps: true }
)

export const Convertion = mongoose.model('convertion', convertionSchema)

const referralSchema = new mongoose.Schema(
  {
    status: {
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

export const Referral = mongoose.model('referral', referralSchema)