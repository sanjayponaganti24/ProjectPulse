import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    description: { type: String, trim: true, default: '' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'], default: 'TODO' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    dueDate: { type: Date, required: true },
  },
  { timestamps: true },
)

export default mongoose.model('Task', taskSchema)
