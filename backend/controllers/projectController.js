import mongoose from 'mongoose'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import User from '../models/User.js'

const userFields = 'name email role avatar'
const projectLeadFields = 'name role avatar'

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
  const project = await Project.findById(req.params.id)
    .populate('manager', userFields)
    .populate('teamLead', userFields)
    .populate('members', userFields)
    .populate('stakeholders', userFields)

  if (!project) {
    res.status(404).json({ success: false, message: 'Project not found.' })
    return null
  }
  return project
}

function canManage(project, user) {
  if (user.role === 'ORGANISATION_ADMIN') return true
  const managerId = (project.manager?._id || project.manager)?.toString()
  return managerId === user._id.toString()
}

function isParticipant(project, user) {
  if (user.role === 'ORGANISATION_ADMIN') return true
  const userId = user._id.toString()
  const teamLeadId = (project.teamLead?._id || project.teamLead)?.toString()
  if (teamLeadId === userId) return true

  const isMember = project.members && project.members.some((m) => (m._id || m).toString() === userId)
  if (isMember) return true

  const isStakeholder =
    project.stakeholders && project.stakeholders.some((s) => (s._id || s).toString() === userId)
  if (isStakeholder) return true

  return false
}

function participantFilter(user) {
  return {
    $or: [
      { manager: user._id },
      { teamLead: user._id },
      { members: user._id },
      { stakeholders: user._id },
    ],
  }
}

function applyProjectFilters(filter, query) {
  const clauses = [filter]
  if (query.status) clauses.push({ status: query.status })
  if (query.search) {
    const searchRegex = { $regex: query.search, $options: 'i' }
    clauses.push({ $or: [{ name: searchRegex }, { description: searchRegex }] })
  }
  return clauses.length === 1 ? filter : { $and: clauses }
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
    const isAdmin = req.user.role === 'ORGANISATION_ADMIN'
    const myFilter = applyProjectFilters(isAdmin ? {} : participantFilter(req.user), req.query)
    const myProjects = await Project.find(myFilter)
      .populate('manager', userFields)
      .populate('teamLead', userFields)
      .populate('members', userFields)
      .populate('stakeholders', userFields)
      .sort({ createdAt: -1 })

    if (isAdmin) {
      const projects = await Promise.all(myProjects.map(withProgress))
      res.json({ success: true, projects, myProjects: projects, otherProjects: [] })
      return
    }

    const myProjectIds = myProjects.map((project) => project._id)
    const otherProjects = await Project.find(
      applyProjectFilters({ _id: { $nin: myProjectIds } }, req.query),
    )
      .populate('manager', projectLeadFields)
      .populate('teamLead', projectLeadFields)
      .sort({ createdAt: -1 })

    const [myProjectsWithProgress, otherProjectsWithProgress] = await Promise.all([
      Promise.all(myProjects.map(withProgress)),
      Promise.all(
        otherProjects.map(async (project) => {
          const limitedProject = await withProgress(project)
          delete limitedProject.members
          delete limitedProject.stakeholders
          delete limitedProject.progress
          return limitedProject
        }),
      ),
    ])

    res.json({
      success: true,
      projects: [...myProjectsWithProgress, ...otherProjectsWithProgress],
      myProjects: myProjectsWithProgress,
      otherProjects: otherProjectsWithProgress,
    })
  } catch (error) {
    next(error)
  }
}

export async function getProject(req, res, next) {
  try {
    const project = await findProject(req, res)
    if (!project) return
    const projectData = await withProgress(project)
    if (!isParticipant(project, req.user)) {
      delete projectData.members
      delete projectData.stakeholders
      delete projectData.progress
    }
    res.json({ success: true, project: projectData, readOnly: !isParticipant(project, req.user) })
  } catch (error) {
    next(error)
  }
}

export async function createProject(req, res, next) {
  try {
    const {
      name,
      description,
      startDate,
      deadline,
      status,
      manager,
      teamLead,
      members = [],
      stakeholders = [],
    } = req.body

    const validateIds = (list) => Array.isArray(list) && list.every((id) => validId(id))

    if (!validateIds(members) || !validateIds(stakeholders)) {
      sendInvalidId(res)
      return
    }

    if (teamLead && !validId(teamLead)) {
      sendInvalidId(res)
      return
    }

    let assignedManager = req.user._id
    if (req.user.role === 'ORGANISATION_ADMIN' && manager && validId(manager)) {
      const managerUser = await User.findById(manager)
      if (managerUser) assignedManager = managerUser._id
    }

    const uniqueMembers = [...new Set(members.map((id) => id.toString()))]
    const uniqueStakeholders = [...new Set(stakeholders.map((id) => id.toString()))]

    const allParticipantIds = [
      assignedManager.toString(),
      ...(teamLead ? [teamLead.toString()] : []),
      ...uniqueMembers,
      ...uniqueStakeholders,
    ]

    const count = await User.countDocuments({ _id: { $in: allParticipantIds } })
    const expectedCount = new Set(allParticipantIds).size
    if (count !== expectedCount) {
      res.status(400).json({ success: false, message: 'One or more assigned users do not exist.' })
      return
    }

    const project = await Project.create({
      name,
      description,
      startDate,
      deadline,
      status,
      manager: assignedManager,
      teamLead: teamLead || null,
      members: uniqueMembers,
      stakeholders: uniqueStakeholders,
    })

    await project.populate('manager', userFields)
    await project.populate('teamLead', userFields)
    await project.populate('members', userFields)
    await project.populate('stakeholders', userFields)

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
      res.status(403).json({ success: false, message: 'Only the project manager or organisation admin can edit this project.' })
      return
    }

    const allowed = ['name', 'description', 'startDate', 'deadline', 'status']
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) project[field] = req.body[field]
    })

    if (req.body.manager !== undefined && req.user.role === 'ORGANISATION_ADMIN') {
      if (validId(req.body.manager)) project.manager = req.body.manager
    }

    if (req.body.teamLead !== undefined) {
      project.teamLead = req.body.teamLead && validId(req.body.teamLead) ? req.body.teamLead : null
    }

    if (Array.isArray(req.body.members)) {
      project.members = [...new Set(req.body.members.filter(validId))]
    }

    if (Array.isArray(req.body.stakeholders)) {
      project.stakeholders = [...new Set(req.body.stakeholders.filter(validId))]
    }

    await project.save()
    await project.populate('manager', userFields)
    await project.populate('teamLead', userFields)
    await project.populate('members', userFields)
    await project.populate('stakeholders', userFields)

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
      res.status(403).json({ success: false, message: 'Only the project manager or organisation admin can delete this project.' })
      return
    }
    await Project.deleteOne({ _id: project._id })
    await Task.deleteMany({ project: project._id })
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
      res.status(403).json({ success: false, message: 'Only the project manager or organisation admin can manage members.' })
      return
    }

    const memberId = req.body.memberId || req.body.userId
    const member = memberId
      ? validId(memberId)
        ? await User.findById(memberId).select(userFields)
        : null
      : req.body.email
        ? await User.findOne({ email: req.body.email.toLowerCase().trim() }).select(userFields)
        : null

    if (!memberId && !req.body.email) {
      res.status(400).json({ success: false, message: 'A member ID or email is required.' })
      return
    }
    if (!member) {
      res.status(404).json({ success: false, message: 'User not found.' })
      return
    }

    const memberObjectId = member._id.toString()
    const roleInProject = req.body.roleInProject || 'MEMBER'

    if (roleInProject === 'TEAM_LEAD') {
      project.teamLead = member._id
    } else if (roleInProject === 'STAKEHOLDER') {
      if (!project.stakeholders.some((item) => (item._id || item).toString() === memberObjectId)) {
        project.stakeholders.push(member._id)
      }
    } else {
      if (!project.members.some((item) => (item._id || item).toString() === memberObjectId)) {
        project.members.push(member._id)
      }
    }

    await project.save()
    await project.populate('manager', userFields)
    await project.populate('teamLead', userFields)
    await project.populate('members', userFields)
    await project.populate('stakeholders', userFields)

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
      res.status(403).json({ success: false, message: 'Only the project manager or organisation admin can manage members.' })
      return
    }
    if (!validId(req.params.memberId)) {
      sendInvalidId(res)
      return
    }

    const memberId = req.params.memberId
    project.members = project.members.filter((m) => (m._id || m).toString() !== memberId)
    project.stakeholders = project.stakeholders.filter((s) => (s._id || s).toString() !== memberId)
    if (project.teamLead && (project.teamLead._id || project.teamLead).toString() === memberId) {
      project.teamLead = null
    }

    await project.save()
    await project.populate('manager', userFields)
    await project.populate('teamLead', userFields)
    await project.populate('members', userFields)
    await project.populate('stakeholders', userFields)

    res.json({ success: true, project: await withProgress(project) })
  } catch (error) {
    next(error)
  }
}
