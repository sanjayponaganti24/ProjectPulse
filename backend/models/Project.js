import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, trim: true, default: '' },
    startDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['PLANNED', 'ACTIVE', 'COMPLETED'], default: 'PLANNED' },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teamLead: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    stakeholders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
)

projectSchema.path('deadline').validate(function validateDeadline(value) {
  return !this.startDate || value >= this.startDate
}, 'Deadline must be on or after the start date.')

export default mongoose.model('Project', projectSchema)
