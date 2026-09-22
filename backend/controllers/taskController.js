import mongoose from 'mongoose'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import User from '../models/User.js'

const userFields = 'name email role avatar'
const taskPopulate = [
  { path: 'project', select: 'name manager members' },
  { path: 'assignedTo', select: userFields },
  { path: 'createdBy', select: userFields },
]

function validId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

function canView(project, user) {
  return project.manager.toString() === user._id.toString()
    || project.members.some((member) => member.toString() === user._id.toString())
}

function isManager(project, user) {
  return project.manager.toString() === user._id.toString()
}

async function loadProject(projectId, res) {
  if (!validId(projectId)) {
    res.status(400).json({ success: false, message: 'A valid project ID is required.' })
    return null
  }
  const project = await Project.findById(projectId).select('manager members')
  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found.' })
    return null
  }
  return project
}

async function validateAssignee(project, assignedTo, res) {
  if (!validId(assignedTo)) {
    res.status(400).json({ success: false, message: 'A valid assigned user ID is required.' })
    return null
  }
  const user = await User.findOne({ $and: [{ _id: assignedTo }, { _id: { $in: project.members } }] }).select('_id')
  if (!user) {
    res.status(400).json({ success: false, message: 'Assigned user must belong to the project.' })
  }
  return user
}

async function loadTask(req, res) {
  if (!validId(req.params.id)) {
    res.status(400).json({ success: false, message: 'A valid task ID is required.' })
    return null
  }
  const task = await Task.findById(req.params.id)
  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found.' })
    return null
  }
  return task
}

function accessibleFilter(user) {
  if (user.role === 'PROJECT_MANAGER') return { project: { $in: user._projectIds } }
  return { $or: [{ assignedTo: user._id }, { project: { $in: user._projectIds } }] }
}

async function projectIdsForMember(user) {
  const filter = user.role === 'PROJECT_MANAGER' ? { manager: user._id } : { members: user._id }
  const projects = await Project.find(filter).select('_id')
  return projects.map((project) => project._id)
}

async function sendTask(res, task, status = 200) {
  await task.populate(taskPopulate)
  res.status(status).json({ success: true, task })
}

export async function listTasks(req, res, next) {
  try {
    req.user._projectIds = await projectIdsForMember(req.user)
    const filter = accessibleFilter(req.user)
    if (req.query.project) {
      if (!validId(req.query.project)) {
        res.status(400).json({ success: false, message: 'A valid project ID is required.' })
        return
      }
      filter.project = req.query.project
    }
    if (req.query.status) filter.status = req.query.status
    if (req.query.priority) filter.priority = req.query.priority
    const tasks = await Task.find(filter).populate(taskPopulate).sort({ dueDate: 1, createdAt: -1 })
    res.json({ success: true, tasks })
  } catch (error) {
    next(error)
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await loadTask(req, res)
    if (!task) return
    const project = await loadProject(task.project, res)
    if (!project) return
    if (!canView(project, req.user) && task.assignedTo.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'You do not have access to this task.' })
      return
    }
    await sendTask(res, task)
  } catch (error) {
    next(error)
  }
}

export async function createTask(req, res, next) {
  try {
    const project = await loadProject(req.body.project, res)
    if (!project) return
    if (!isManager(project, req.user)) {
      res.status(403).json({ success: false, message: 'Only the project manager can create tasks.' })
      return
    }
    if (!await validateAssignee(project, req.body.assignedTo, res)) return
    const task = await Task.create({ ...req.body, createdBy: req.user._id })
    await sendTask(res, task, 201)
  } catch (error) {
    next(error)
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await loadTask(req, res)
    if (!task) return
    const project = await loadProject(task.project, res)
    if (!project) return
    const manager = isManager(project, req.user)
    const ownTask = task.assignedTo.toString() === req.user._id.toString()
    if (!manager && (!ownTask || Object.keys(req.body).some((field) => field !== 'status'))) {
      res.status(403).json({ success: false, message: 'Members may only update the status of tasks assigned to them.' })
      return
    }
    if (req.body.project && req.body.project.toString() !== task.project.toString()) {
      const newProject = await loadProject(req.body.project, res)
      if (!newProject) return
      if (!isManager(newProject, req.user)) {
        res.status(403).json({ success: false, message: 'Only the new project manager can move a task.' })
        return
      }
      project.manager = newProject.manager
      project.members = newProject.members
    }
    if (manager && !await validateAssignee(project, req.body.assignedTo || task.assignedTo, res)) return
    const allowed = ['title', 'description', 'project', 'assignedTo', 'status', 'priority', 'dueDate']
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field]
    })
    await task.save()
    await sendTask(res, task)
  } catch (error) {
    next(error)
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await loadTask(req, res)
    if (!task) return
    const project = await loadProject(task.project, res)
    if (!project) return
    if (!isManager(project, req.user)) {
      res.status(403).json({ success: false, message: 'Only the project manager can delete tasks.' })
      return
    }
    await task.deleteOne()
    res.json({ success: true, message: 'Task deleted successfully.' })
  } catch (error) {
    next(error)
  }
}
