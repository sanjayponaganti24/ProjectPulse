import mongoose from 'mongoose'

const issueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, trim: true, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], default: 'OPEN' },
  },
  { timestamps: true },
)

export default mongoose.model('Issue', issueSchema)
