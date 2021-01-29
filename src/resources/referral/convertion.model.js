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