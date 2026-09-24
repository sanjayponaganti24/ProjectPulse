import Project from '../models/Project.js'
import Task from '../models/Task.js'
import Issue from '../models/Issue.js'

async function getAccessibleProjectIds(user) {
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

function getPeriodMatch(period) {
  if (period === 'all-time') return {}

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), period === 'last-month' ? 1 : 1)
  const end = new Date(now.getFullYear(), now.getMonth() + (period === 'last-month' ? 0 : 1), 1)

  if (period === 'last-month') {
    start.setMonth(start.getMonth() - 1)
  }

  return { createdAt: { $gte: start, $lt: end } }
}

export async function getReports(req, res, next) {
  try {
    const projectIds = await getAccessibleProjectIds(req.user)
    const periodMatch = getPeriodMatch(req.query.period || 'this-month')

    if (projectIds.length === 0) {
      return res.json({
        success: true,
        reports: {
          projects: { total: 0, active: 0, completed: 0 },
          tasks: { total: 0, todo: 0, inProgress: 0, completed: 0, byPriority: [] },
          issues: { total: 0, open: 0, resolved: 0, bySeverity: [] },
          projectProgress: [],
        },
      })
    }

    const [
      projectStats,
      taskStats,
      taskPriorityStats,
      issueStats,
      issueSeverityStats,
      projectProgressData,
    ] = await Promise.all([
      Project.aggregate([
        { $match: { _id: { $in: projectIds }, ...periodMatch } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          },
        },
      ]),
      Task.aggregate([
        { $match: { project: { $in: projectIds }, ...periodMatch } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            todo: { $sum: { $cond: [{ $eq: ['$status', 'TODO'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          },
        },
      ]),
      Task.aggregate([
        { $match: { project: { $in: projectIds }, ...periodMatch } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } },
        { $sort: { name: 1 } },
      ]),
      Issue.aggregate([
        { $match: { project: { $in: projectIds }, ...periodMatch } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            open: { $sum: { $cond: [{ $eq: ['$status', 'OPEN'] }, 1, 0] } },
            resolved: { $sum: { $cond: [{ $in: ['$status', ['RESOLVED', 'CLOSED']] }, 1, 0] } },
          },
        },
      ]),
      Issue.aggregate([
        { $match: { project: { $in: projectIds }, ...periodMatch } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } },
        { $sort: { name: 1 } },
      ]),
      Project.aggregate([
        { $match: { _id: { $in: projectIds }, ...periodMatch } },
        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'project',
            as: 'tasks',
          },
        },
        {
          $project: {
            name: 1,
            status: 1,
            totalTasks: { $size: '$tasks' },
            completedTasks: {
              $size: {
                $filter: {
                  input: '$tasks',
                  cond: { $eq: ['$$this.status', 'COMPLETED'] },
                },
              },
            },
          },
        },
        {
          $project: {
            name: 1,
            status: 1,
            progress: {
              $cond: [
                { $eq: ['$totalTasks', 0] },
                0,
                { $round: [{ $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }] },
              ],
            },
          },
        },
        { $sort: { progress: -1 } },
      ]),
    ])

    const projectData = projectStats[0] || { total: 0, active: 0, completed: 0 }
    const taskData = taskStats[0] || { total: 0, todo: 0, inProgress: 0, completed: 0 }
    const issueData = issueStats[0] || { total: 0, open: 0, resolved: 0 }

    const priorityColors = {
      LOW: '#8bb7a4',
      MEDIUM: '#d2a85b',
      HIGH: '#d87979',
    }

    const severityColors = {
      LOW: '#8bb7a4',
      MEDIUM: '#d2a85b',
      HIGH: '#d87979',
      CRITICAL: '#b84a4a',
    }

    const tasksByPriority = taskPriorityStats.map((item) => ({
      name: item.name,
      value: item.value,
      color: priorityColors[item.name] || '#8bb7a4',
    }))

    const issuesBySeverity = issueSeverityStats.map((item) => ({
      name: item.name,
      value: item.value,
      color: severityColors[item.name] || '#8bb7a4',
    }))

    res.json({
      success: true,
      reports: {
        projects: {
          total: projectData.total,
          active: projectData.active,
          completed: projectData.completed,
        },
        tasks: {
          total: taskData.total,
          todo: taskData.todo,
          inProgress: taskData.inProgress,
          completed: taskData.completed,
          byPriority: tasksByPriority,
        },
        issues: {
          total: issueData.total,
          open: issueData.open,
          resolved: issueData.resolved,
          bySeverity: issuesBySeverity,
        },
        projectProgress: projectProgressData,
      },
    })
  } catch (error) {
    next(error)
  }
}
