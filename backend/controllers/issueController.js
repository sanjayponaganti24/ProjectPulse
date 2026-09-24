import mongoose from 'mongoose'
import Issue from '../models/Issue.js'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import User from '../models/User.js'

const userFields = 'name email role avatar'
const issuePopulate = [
  { path: 'project', select: 'name manager teamLead members stakeholders' },
  { path: 'task', select: 'title project' },
  { path: 'reportedBy', select: userFields },
  { path: 'assignedTo', select: userFields },
]

function validId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

function canManage(project, user) {
  if (user.role === 'ORGANISATION_ADMIN') return true
  const userId = user._id.toString()
  if (project.manager && project.manager.toString() === userId) return true
  if (project.teamLead && project.teamLead.toString() === userId) return true
  return false
}

function canView(project, user) {
  if (user.role === 'ORGANISATION_ADMIN') return true
  if (project.status === 'ACTIVE') return true
  if (canManage(project, user)) return true
  const userId = user._id.toString()
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

async function loadIssue(issueId, res) {
  if (!validId(issueId)) {
    res.status(400).json({ success: false, message: 'A valid issue ID is required.' })
    return null
  }
  const issue = await Issue.findById(issueId)
  if (!issue) {
    res.status(404).json({ success: false, message: 'Issue not found.' })
    return null
  }
  return issue
}

async function validateAssignment(project, assignedTo, res) {
  if (assignedTo === null || assignedTo === undefined || assignedTo === '') return true
  if (!validId(assignedTo)) {
    res.status(400).json({ success: false, message: 'A valid assigned user ID is required.' })
    return false
  }

  const assignedStr = assignedTo.toString()
  const belongs =
    (project.manager && project.manager.toString() === assignedStr) ||
    (project.teamLead && project.teamLead.toString() === assignedStr) ||
    (project.members && project.members.some((m) => m.toString() === assignedStr))

  if (!belongs || !(await User.exists({ _id: assignedTo }))) {
    res.status(400).json({ success: false, message: 'Assigned user must be an active project member.' })
    return false
  }
  return true
}

async function validateTask(project, taskId, res) {
  if (taskId === null || taskId === undefined || taskId === '') return true
  if (!validId(taskId)) {
    res.status(400).json({ success: false, message: 'A valid task ID is required.' })
    return false
  }
  if (!(await Task.exists({ _id: taskId, project: project._id }))) {
    res.status(400).json({ success: false, message: 'Task must belong to the project.' })
    return false
  }
  return true
}

async function sendIssue(res, issue, status = 200) {
  await issue.populate(issuePopulate)
  res.status(status).json({ success: true, issue })
}

export async function listIssues(req, res, next) {
  try {
    const filter = {}
    if (req.query.project !== undefined) {
      const project = await loadProject(req.query.project, res)
      if (!project) return
      if (!canView(project, req.user)) {
        res.status(403).json({ success: false, message: 'You do not have access to this project.' })
        return
      }
      filter.project = project._id
    } else if (req.user.role !== 'ORGANISATION_ADMIN') {
      const projects = await Project.find({
        $or: [
          { manager: req.user._id },
          { teamLead: req.user._id },
          { members: req.user._id },
          { stakeholders: req.user._id },
          { status: 'ACTIVE' },
        ],
      }).select('_id')
      filter.project = { $in: projects.map((p) => p._id) }
    }

    if (req.query.status !== undefined) filter.status = req.query.status
    if (req.query.severity !== undefined) filter.severity = req.query.severity

    const issues = await Issue.find(filter).populate(issuePopulate).sort({ createdAt: -1 })
    res.json({ success: true, issues })
  } catch (error) {
    next(error)
  }
}

export async function getIssue(req, res, next) {
  try {
    const issue = await loadIssue(req.params.id, res)
    if (!issue) return
    const project = await loadProject(issue.project, res)
    if (!project) return
    if (!canView(project, req.user)) {
      res.status(403).json({ success: false, message: 'You do not have access to this issue.' })
      return
    }
    await sendIssue(res, issue)
  } catch (error) {
    next(error)
  }
}

export async function createIssue(req, res, next) {
  try {
    if (req.user.role === 'STAKEHOLDER') {
      res.status(403).json({ success: false, message: 'Stakeholders have read-only access and cannot report issues.' })
      return
    }

    const project = await loadProject(req.body.project, res)
    if (!project) return
    if (!canView(project, req.user)) {
      res.status(403).json({ success: false, message: 'You do not have access to this project.' })
      return
    }
    if (!isProjectParticipant(project, req.user) || req.user.role === 'STAKEHOLDER') {
      res.status(403).json({ success: false, message: 'Read-only viewers cannot report issues.' })
      return
    }

    const isProjectManagerOrLead = canManage(project, req.user)
    if (!isProjectManagerOrLead && req.body.assignedTo !== undefined && req.body.assignedTo !== null) {
      res.status(403).json({
        success: false,
        message: 'Only the project manager, team lead, or organisation admin can assign issues.',
      })
      return
    }

    if (!(await validateTask(project, req.body.task, res)) || !(await validateAssignment(project, req.body.assignedTo, res))) {
      return
    }

    const issue = await Issue.create({
      title: req.body.title,
      description: req.body.description,
      project: project._id,
      task: req.body.task || null,
      reportedBy: req.user._id,
      assignedTo: req.body.assignedTo || null,
      severity: req.body.severity,
      status: req.body.status,
    })
    await sendIssue(res, issue, 201)
  } catch (error) {
    next(error)
  }
}

export async function updateIssue(req, res, next) {
  try {
    if (req.user.role === 'STAKEHOLDER') {
      res.status(403).json({ success: false, message: 'Stakeholders have read-only access.' })
      return
    }

    const issue = await loadIssue(req.params.id, res)
    if (!issue) return
    const project = await loadProject(issue.project, res)
    if (!project) return

    if (!isProjectParticipant(project, req.user)) {
      res.status(403).json({ success: false, message: 'Read-only viewers cannot edit issues.' })
      return
    }

    const isAuthorizedManager = canManage(project, req.user)
    const isReporter = issue.reportedBy && issue.reportedBy.toString() === req.user._id.toString()
    const isAssignee = issue.assignedTo && issue.assignedTo.toString() === req.user._id.toString()

    if (!isAuthorizedManager && !isReporter && !isAssignee) {
      res.status(403).json({ success: false, message: 'You do not have permission to edit this issue.' })
      return
    }

    if (req.body.project !== undefined && req.body.project.toString() !== issue.project.toString()) {
      res.status(400).json({ success: false, message: 'Issue project cannot be changed.' })
      return
    }

    if (!(await validateTask(project, req.body.task, res)) || !(await validateAssignment(project, req.body.assignedTo, res))) {
      return
    }

    const allowed = ['title', 'description', 'task', 'assignedTo', 'severity', 'status']
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) issue[field] = req.body[field] === '' ? null : req.body[field]
    })
    await issue.save()
    await sendIssue(res, issue)
  } catch (error) {
    next(error)
  }
}

export async function deleteIssue(req, res, next) {
  try {
    const issue = await loadIssue(req.params.id, res)
    if (!issue) return
    const project = await loadProject(issue.project, res)
    if (!project) return

    const isAuthorized =
      req.user.role === 'ORGANISATION_ADMIN' ||
      (project.manager && project.manager.toString() === req.user._id.toString())

    if (!isAuthorized) {
      res.status(403).json({
        success: false,
        message: 'Only the project manager or organisation admin can delete issues.',
      })
      return
    }
    await issue.deleteOne()
    res.json({ success: true, message: 'Issue deleted successfully.' })
  } catch (error) {
    next(error)
  }
}
