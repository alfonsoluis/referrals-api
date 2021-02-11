import mongoose from 'mongoose'

export const conversionSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { timestamps: true }
)

// export const Conversion = mongoose.model('conversion', conversionSchema)

export const Conversion =
  mongoose.models.conversion || mongoose.model('conversion', conversionSchema)
