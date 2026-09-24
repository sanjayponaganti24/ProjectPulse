import mongoose from 'mongoose'
import Notification from '../models/Notification.js'
import User from '../models/User.js'

function validId(value) {
  return mongoose.Types.ObjectId.isValid(value)
}

export async function listNotifications(req, res, next) {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('actor', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(100)
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false })
    res.json({ success: true, notifications, unreadCount })
  } catch (error) {
    next(error)
  }
}

export async function createNotification(req, res, next) {
  try {
    const { recipient, type, title, message, link, actor } = req.body
    if (!validId(recipient) || !(await User.exists({ _id: recipient }))) {
      res.status(400).json({ success: false, message: 'A valid notification recipient is required.' })
      return
    }
    if (actor && !validId(actor)) {
      res.status(400).json({ success: false, message: 'A valid notification actor is required.' })
      return
    }
    const notification = await Notification.create({
      recipient,
      actor: actor || req.user._id,
      type,
      title,
      message,
      link,
    })
    await notification.populate('actor', 'name avatar role')
    res.status(201).json({ success: true, notification })
  } catch (error) {
    next(error)
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    if (!validId(req.params.id)) {
      res.status(400).json({ success: false, message: 'A valid notification ID is required.' })
      return
    }
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true },
    )
    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found.' })
      return
    }
    res.json({ success: true, notification })
  } catch (error) {
    next(error)
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
