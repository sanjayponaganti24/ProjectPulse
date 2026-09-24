import { useEffect, useState } from "react";
import { CheckCheck } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../components/UI.jsx";
import NotificationItem from "../components/NotificationItem.jsx";
import api from "../services/api.js";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotifications() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications || []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markRead(notification) {
    if (!notification.isRead) {
      try {
        await api.patch(`/notifications/${notification._id}/read`);
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item,
          ),
        );
      } catch {
        // Navigation should still work if marking read fails.
      }
    }
    if (notification.link) window.location.assign(notification.link);
  }

  async function markAllRead() {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update notifications.",
      );
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Notifications"
        description="Stay current on activity across your projects and tasks."
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" icon={CheckCheck} onClick={markAllRead}>
              Mark all as read
            </Button>
          )
        }
      />
      {loading ? (
        <LoadingState message="Loading notifications..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadNotifications} />
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState
            title="You're all caught up"
            description="New activity will appear here when your team has updates for you."
          />
        </Card>
      ) : (
        <Card className="notification-list">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onClick={() => markRead(notification)}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
