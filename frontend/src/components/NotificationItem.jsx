import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Info,
  MessageCircle,
  Target,
} from "lucide-react";
import { Avatar } from "./UI.jsx";

const icons = {
  TASK: CheckCircle2,
  PROJECT: Target,
  ISSUE: CircleAlert,
  MILESTONE: Target,
  MENTION: MessageCircle,
  INFO: Info,
};

export default function NotificationItem({ notification, onClick }) {
  const Icon = icons[notification.type] || Bell;
  const createdAt = new Date(notification.createdAt);

  return (
    <button
      type="button"
      className={`notification-item${notification.isRead ? "" : " notification-item-unread"}`}
      onClick={onClick}
    >
      <span className="notification-icon" aria-hidden="true">
        <Icon size={17} />
      </span>
      <span className="notification-content">
        <strong>{notification.title}</strong>
        <span>{notification.message}</span>
        <small>
          {notification.actor?.name ? `${notification.actor.name} · ` : ""}
          {Number.isNaN(createdAt.getTime()) ? "" : createdAt.toLocaleString()}
        </small>
      </span>
      {notification.actor && (
        <Avatar
          name={notification.actor.name}
          avatar={notification.actor.avatar}
          size="sm"
        />
      )}
      {!notification.isRead && (
        <span className="notification-unread-dot" aria-label="Unread" />
      )}
    </button>
  );
}
