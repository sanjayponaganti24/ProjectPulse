import mongoose from 'mongoose'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import User from '../models/User.js'

const userFields = 'name email role avatar'

function validId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

function sendInvalidId(res) {
  res.status(400).json({ success: false, message: 'A valid project or user ID is required.' })
}

async function findProject(req, res) {
  if (!validId(req.params.id)) {
    sendInvalidId(res)
    return null
  }
  const project = await Project.findById(req.params.id).populate('manager', userFields).populate('members', userFields)
  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found.' })
    return null
  }
  return project
}

function canManage(project, user) {
  return project.manager._id.toString() === user._id.toString()
}

function canView(project, user) {
  return canManage(project, user) || project.members.some((member) => member._id.toString() === user._id.toString())
}

async function withProgress(project) {
  const [total, completed] = await Promise.all([
    Task.countDocuments({ project: project._id }),
    Task.countDocuments({ project: project._id, status: 'COMPLETED' }),
  ])
  return { ...project.toObject(), progress: total ? Math.round((completed / total) * 100) : 0 }
}

export async function listProjects(req, res, next) {
  try {
    const filter = req.user.role === 'PROJECT_MANAGER'
      ? { manager: req.user._id }
      : { members: req.user._id }
    if (req.query.status) filter.status = req.query.status
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ]
    }
    const projects = await Project.find(filter).populate('manager', userFields).populate('members', userFields).sort({ createdAt: -1 })
    const projectsWithProgress = await Promise.all(projects.map(withProgress))
    res.json({ success: true, projects: projectsWithProgress })
  } catch (error) {
    next(error)
  }
}

export async function getProject(req, res, next) {
  try {
    const project = await findProject(req, res)
    if (!project) return
    if (!canView(project, req.user)) {
      res.status(403).json({ success: false, message: 'You do not have access to this project.' })
      return
    }
    res.json({ success: true, project: await withProgress(project) })
  } catch (error) {
    next(error)
  }
}

export async function createProject(req, res, next) {
  try {
    const { name, description, startDate, deadline, status, members = [] } = req.body
    if (!Array.isArray(members) || members.some((id) => !validId(id))) {
      sendInvalidId(res)
      return
    }
    const uniqueMembers = [...new Set(members.map((id) => id.toString()))]
    const count = await User.countDocuments({ _id: { $in: uniqueMembers } })
    if (count !== uniqueMembers.length) {
      res.status(400).json({ success: false, message: 'One or more members do not exist.' })
      return
    }
    const project = await Project.create({ name, description, startDate, deadline, status, manager: req.user._id, members: uniqueMembers })
    await project.populate('manager', userFields)
    await project.populate('members', userFields)
    res.status(201).json({ success: true, project })
  } catch (error) {
    next(error)
  }
}

export async function updateProject(req, res, next) {
  try {
    const project = await findProject(req, res)
    if (!project) return
    if (!canManage(project, req.user)) {
      res.status(403).json({ success: false, message: 'Only the project manager can edit this project.' })
      return
    }
    const allowed = ['name', 'description', 'startDate', 'deadline', 'status']
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field]
    })
    await project.save()
    await project.populate('manager', userFields)
    await project.populate('members', userFields)
    res.json({ success: true, project: await withProgress(project) })
  } catch (error) {
    next(error)
  }
}

export async function deleteProject(req, res, next) {
  try {
    const project = await findProject(req, res)
    if (!project) return
    if (!canManage(project, req.user)) {
      res.status(403).json({ success: false, message: 'Only the project manager can delete this project.' })
      return
    }
    await Project.deleteOne({ _id: project._id })
    res.json({ success: true, message: 'Project deleted successfully.' })
  } catch (error) {
    next(error)
  }
}

export async function addMember(req, res, next) {
  try {
    const project = await findProject(req, res)
    if (!project) return
    if (!canManage(project, req.user)) {
      res.status(403).json({ success: false, message: 'Only the project manager can manage members.' })
      return
    }
    const memberId = req.body.memberId || req.body.userId
    const member = memberId
      ? validId(memberId) ? await User.findById(memberId).select(userFields) : null
      : req.body.email ? await User.findOne({ email: req.body.email.toLowerCase().trim() }).select(userFields) : null
    if (!memberId && !req.body.email) {
      res.status(400).json({ success: false, message: 'A member ID or email is required.' })
      return
    }
    if (!member) {
      res.status(404).json({ success: false, message: 'Member not found.' })
      return
    }
    if (!project.members.some((item) => item._id.toString() === memberId.toString())) {
      project.members.push(member._id)
      await project.save()
    }
    await project.populate('manager', userFields)
    await project.populate('members', userFields)
    res.json({ success: true, project: await withProgress(project) })
  } catch (error) {
    next(error)
  }
}

export async function removeMember(req, res, next) {
  try {
    const project = await findProject(req, res)
    if (!project) return
    if (!canManage(project, req.user)) {
      res.status(403).json({ success: false, message: 'Only the project manager can manage members.' })
      return
    }
    if (!validId(req.params.memberId)) {
      sendInvalidId(res)
      return
    }
    project.members = project.members.filter((member) => member._id.toString() !== req.params.memberId)
    await project.save()
    await project.populate('manager', userFields)
    await project.populate('members', userFields)
    res.json({ success: true, project: await withProgress(project) })
  } catch (error) {
    next(error)
  }
}
