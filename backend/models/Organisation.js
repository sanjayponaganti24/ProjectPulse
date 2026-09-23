import mongoose from 'mongoose'

const organisationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'ProjectPulse Workspace',
    },
    domain: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
)

export default mongoose.model('Organisation', organisationSchema)
