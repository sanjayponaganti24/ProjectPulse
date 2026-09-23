import mongoose from 'mongoose'
import Milestone from '../models/Milestone.js'
import Project from '../models/Project.js'

const userFields = 'name email role avatar'

function validId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

function isAuthorizedPMOrAdmin(project, user) {
  if (user.role === 'ORGANISATION_ADMIN') return true
  return project.manager && project.manager.toString() === user._id.toString()
}

function canView(project, user) {
  if (user.role === 'ORGANISATION_ADMIN') return true
  if (isAuthorizedPMOrAdmin(project, user)) return true
  const userId = user._id.toString()
  if (project.teamLead && project.teamLead.toString() === userId) return true
  if (project.members && project.members.some((m) => m.toString() === userId)) return true
  if (project.stakeholders && project.stakeholders.some((s) => s.toString() === userId)) return true
  return false
}

async function loadProject(projectId, res) {
  if (!validId(projectId)) {
    res.status(400).json({ success: false, message: 'A valid project ID is required.' })
    return null
  }
  const project = await Project.findById(projectId).select('manager teamLead members stakeholders')
  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found.' })
    return null
  }
  return project
}

async function loadMilestone(milestoneId, res) {
  if (!validId(milestoneId)) {
    res.status(400).json({ success: false, message: 'A valid milestone ID is required.' })
    return null
  }
  const milestone = await Milestone.findById(milestoneId)
  if (!milestone) {
    res.status(404).json({ success: false, message: 'Milestone not found.' })
    return null
  }
  return milestone
}

async function sendMilestone(res, milestone, status = 200) {
  await milestone.populate('createdBy', userFields)
  res.status(status).json({ success: true, milestone })
}

export async function listMilestones(req, res, next) {
  try {
    const project = await loadProject(req.params.projectId, res)
    if (!project) return
    if (!canView(project, req.user)) {
      res.status(403).json({ success: false, message: 'You do not have access to this project.' })
      return
    }
    const milestones = await Milestone.find({ project: project._id })
      .populate('createdBy', userFields)
      .sort({ dueDate: 1, createdAt: -1 })
    res.json({ success: true, milestones })
  } catch (error) {
    next(error)
  }
}

export async function getMilestone(req, res, next) {
  try {
    const milestone = await loadMilestone(req.params.id, res)
    if (!milestone) return
    const project = await loadProject(milestone.project, res)
    if (!project) return
    if (!canView(project, req.user)) {
      res.status(403).json({ success: false, message: 'You do not have access to this milestone.' })
      return
    }
    await sendMilestone(res, milestone)
  } catch (error) {
    next(error)
  }
}

export async function createMilestone(req, res, next) {
  try {
    const project = await loadProject(req.body.project, res)
    if (!project) return
    if (!isAuthorizedPMOrAdmin(project, req.user)) {
      res.status(403).json({
        success: false,
        message: 'Only the project manager or organisation admin can create milestones.',
      })
      return
    }
    const milestone = await Milestone.create({
      name: req.body.name,
      description: req.body.description || '',
      project: project._id,
      dueDate: req.body.dueDate,
      status: req.body.status || 'PLANNED',
      createdBy: req.user._id,
    })
    await sendMilestone(res, milestone, 201)
  } catch (error) {
    next(error)
  }
}

export async function updateMilestone(req, res, next) {
  try {
    const milestone = await loadMilestone(req.params.id, res)
    if (!milestone) return
    const project = await loadProject(milestone.project, res)
    if (!project) return
    if (!isAuthorizedPMOrAdmin(project, req.user)) {
      res.status(403).json({
        success: false,
        message: 'Only the project manager or organisation admin can edit milestones.',
      })
      return
    }
    const allowed = ['name', 'description', 'dueDate', 'status']
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) milestone[field] = req.body[field]
    })
    await milestone.save()
    await sendMilestone(res, milestone)
  } catch (error) {
    next(error)
  }
}

export async function deleteMilestone(req, res, next) {
  try {
    const milestone = await loadMilestone(req.params.id, res)
    if (!milestone) return
    const project = await loadProject(milestone.project, res)
    if (!project) return
    if (!isAuthorizedPMOrAdmin(project, req.user)) {
      res.status(403).json({
        success: false,
        message: 'Only the project manager or organisation admin can delete milestones.',
      })
      return
    }
    await milestone.deleteOne()
    res.json({ success: true, message: 'Milestone deleted successfully.' })
  } catch (error) {
    next(error)
  }
}