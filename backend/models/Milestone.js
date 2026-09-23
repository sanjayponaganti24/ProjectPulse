import mongoose from 'mongoose'

const milestoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, trim: true, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED'], default: 'PLANNED' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

export default mongoose.model('Milestone', milestoneSchema)