import mongoose from 'mongoose'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import User from '../models/User.js'

const userFields = 'name email role avatar'
const taskPopulate = [
  { path: 'project', select: 'name manager teamLead members stakeholders' },
  { path: 'assignedTo', select: userFields },
  { path: 'createdBy', select: userFields },
]

function validId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

function canView(project, user) {
  if (user.role === 'ORGANISATION_ADMIN') return true
  if (project.status === 'ACTIVE') return true
  const userId = user._id.toString()
  if (project.manager && project.manager.toString() === userId) return true
  if (project.teamLead && project.teamLead.toString() === userId) return true
  if (project.members && project.members.some((m) => m.toString() === userId)) return true
  if (project.stakeholders && project.stakeholders.some((s) => s.toString() === userId)) return true
  return false
}

function isProjectParticipant(project, user) {
  const userId = user._id.toString()
  return Boolean(
    (project.manager && project.manager.toString() === userId) ||
    (project.teamLead && project.teamLead.toString() === userId) ||
    (project.members && project.members.some((m) => m.toString() === userId)) ||
    (project.stakeholders && project.stakeholders.some((s) => s.toString() === userId)),
  )
}

function canManageTasks(project, user) {
  if (user.role === 'ORGANISATION_ADMIN') return true
  const userId = user._id.toString()
  if (project.manager && project.manager.toString() === userId) return true
  if (project.teamLead && project.teamLead.toString() === userId) return true
  return false
}

async function loadProject(projectId, res) {
  if (!validId(projectId)) {
    res.status(400).json({ success: false, message: 'A valid project ID is required.' })
    return null
  }
  const project = await Project.findById(projectId).select('status manager teamLead members stakeholders')
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

  const assignedIdStr = assignedTo.toString()

  // Stakeholders cannot be assigned tasks
  if (project.stakeholders && project.stakeholders.some((s) => s.toString() === assignedIdStr)) {
    res.status(400).json({
      success: false,
      message: 'Stakeholders have read-only visibility and cannot be assigned tasks.',
    })
    return null
  }

  // Must belong to members, teamLead, or manager
  const isMember = project.members && project.members.some((m) => m.toString() === assignedIdStr)
  const isTeamLead = project.teamLead && project.teamLead.toString() === assignedIdStr
  const isManager = project.manager && project.manager.toString() === assignedIdStr

  if (!isMember && !isTeamLead && !isManager) {
    res.status(400).json({ success: false, message: 'Assigned user must belong to the project.' })
    return null
  }

  const user = await User.findById(assignedTo).select('_id')
  if (!user) {
    res.status(400).json({ success: false, message: 'Assigned user not found.' })
    return null
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

async function projectIdsForUser(user) {
  if (user.role === 'ORGANISATION_ADMIN') {
    const all = await Project.find({}).select('_id')
    return all.map((p) => p._id)
  }
  const filter = {
    $or: [
      { manager: user._id },
      { teamLead: user._id },
      { members: user._id },
      { stakeholders: user._id },
      { status: 'ACTIVE' },
    ],
  }
  const projects = await Project.find(filter).select('_id')
  return projects.map((p) => p._id)
}

async function sendTask(res, task, status = 200) {
  await task.populate(taskPopulate)
  res.status(status).json({ success: true, task })
}

export async function listTasks(req, res, next) {
  try {
    const projectIds = await projectIdsForUser(req.user)
    const filter =
      req.user.role === 'ORGANISATION_ADMIN' || req.user.role === 'PROJECT_MANAGER'
        ? { project: { $in: projectIds } }
        : { $or: [{ assignedTo: req.user._id }, { project: { $in: projectIds } }] }

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
    if (!canView(project, req.user) && task.assignedTo?.toString() !== req.user._id.toString()) {
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
    if (!canManageTasks(project, req.user)) {
      res.status(403).json({
        success: false,
        message: 'Only the project manager, team lead, or organisation admin can create tasks.',
      })
      return
    }
    if (!(await validateAssignee(project, req.body.assignedTo, res))) return

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

    const isTaskLeadOrManager = canManageTasks(project, req.user)
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString()

    // Stakeholders cannot update anything
    if (req.user.role === 'STAKEHOLDER') {
      res.status(403).json({ success: false, message: 'Stakeholders have read-only access.' })
      return
    }

    if (!isProjectParticipant(project, req.user)) {
      res.status(403).json({ success: false, message: 'Read-only viewers cannot update project tasks.' })
      return
    }

    if (!isTaskLeadOrManager && (!isAssignee || Object.keys(req.body).some((f) => f !== 'status'))) {
      res.status(403).json({
        success: false,
        message: 'Members may only update the status of tasks assigned to them.',
      })
      return
    }

    let assignmentProject = project
    if (req.body.project && req.body.project.toString() !== task.project.toString()) {
      const newProject = await loadProject(req.body.project, res)
      if (!newProject) return
      if (!canManageTasks(newProject, req.user)) {
        res.status(403).json({ success: false, message: 'Only authorized managers can move a task.' })
        return
      }
      assignmentProject = newProject
    }

    if (
      isTaskLeadOrManager &&
      req.body.assignedTo &&
      !(await validateAssignee(assignmentProject, req.body.assignedTo, res))
    ) {
      return
    }

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

    const isAuthorized =
      req.user.role === 'ORGANISATION_ADMIN' ||
      (project.manager && project.manager.toString() === req.user._id.toString())

    if (!isAuthorized) {
      res.status(403).json({
        success: false,
        message: 'Only the project manager or organisation admin can delete tasks.',
      })
      return
    }

    await task.deleteOne()
    res.json({ success: true, message: 'Task deleted successfully.' })
  } catch (error) {
    next(error)
  }
}
