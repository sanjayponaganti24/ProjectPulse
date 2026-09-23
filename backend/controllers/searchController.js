import mongoose from 'mongoose'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import Issue from '../models/Issue.js'
import User from '../models/User.js'

const userFields = 'name email role avatar'

function validId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

function buildSearchRegex(query) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(escaped, 'i')
}

async function getUserProjectIds(user) {
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
    ],
  }
  const projects = await Project.find(filter).select('_id')
  return projects.map((project) => project._id)
}

async function searchProjects(user, query, projectIds) {
  const filter = {
    _id: { $in: projectIds },
    $or: [
      { name: buildSearchRegex(query) },
      { description: buildSearchRegex(query) },
    ],
  }
  return Project.find(filter)
    .populate('manager', userFields)
    .populate('members', userFields)
    .sort({ createdAt: -1 })
    .limit(10)
}

async function searchTasks(user, query, projectIds) {
  const filter = {
    project: { $in: projectIds },
    $or: [
      { title: buildSearchRegex(query) },
      { description: buildSearchRegex(query) },
    ],
  }
  return Task.find(filter)
    .populate([
      { path: 'project', select: 'name' },
      { path: 'assignedTo', select: userFields },
      { path: 'createdBy', select: userFields },
    ])
    .sort({ createdAt: -1 })
    .limit(10)
}

async function searchIssues(user, query, projectIds) {
  const filter = {
    project: { $in: projectIds },
    $or: [
      { title: buildSearchRegex(query) },
      { description: buildSearchRegex(query) },
    ],
  }
  return Issue.find(filter)
    .populate([
      { path: 'project', select: 'name' },
      { path: 'reportedBy', select: userFields },
      { path: 'assignedTo', select: userFields },
      { path: 'task', select: 'title' },
    ])
    .sort({ createdAt: -1 })
    .limit(10)
}

async function searchUsers(user, query, projectIds) {
  const projects = await Project.find({ _id: { $in: projectIds } })
    .select('manager members')
    .lean()

  const memberIds = new Set()
  projects.forEach((project) => {
    memberIds.add(project.manager.toString())
    project.members.forEach((member) => memberIds.add(member.toString()))
  })

  const filter = {
    _id: { $in: Array.from(memberIds) },
    $or: [
      { name: buildSearchRegex(query) },
      { email: buildSearchRegex(query) },
    ],
  }
  return User.find(filter).select(userFields).sort({ name: 1 }).limit(10)
}

export async function search(req, res, next) {
  try {
    const query = req.query.q?.trim()
    if (!query) {
      return res.json({
        success: true,
        projects: [],
        tasks: [],
        issues: [],
        users: [],
      })
    }

    const projectIds = await getUserProjectIds(req.user)

    if (projectIds.length === 0) {
      return res.json({
        success: true,
        projects: [],
        tasks: [],
        issues: [],
        users: [],
      })
    }

    const [projects, tasks, issues, users] = await Promise.all([
      searchProjects(req.user, query, projectIds),
      searchTasks(req.user, query, projectIds),
      searchIssues(req.user, query, projectIds),
      searchUsers(req.user, query, projectIds),
    ])

    res.json({
      success: true,
      projects,
      tasks,
      issues,
      users,
    })
  } catch (error) {
    next(error)
  }
}