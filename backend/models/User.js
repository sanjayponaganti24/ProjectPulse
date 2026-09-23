import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: [
        'ORGANISATION_ADMIN',
        'PROJECT_MANAGER',
        'TEAM_LEAD',
        'MEMBER',
        'STAKEHOLDER',
      ],
      required: true,
      default: 'MEMBER',
    },
    organisation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organisation',
      default: null,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    next()
    return
  }

  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('User', userSchema)
