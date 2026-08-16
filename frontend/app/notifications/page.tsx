"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Notification, getNotifications } from "@/lib/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [readStatus, setReadStatus] = useState("");

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setError("");
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getNotifications()
      .then((data) => {
        setError("");
        setNotifications(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch notifications."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await getNotifications();
      let filtered = data;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (n) =>
            n.message.toLowerCase().includes(q) ||
            String(n.recipient_id) === q ||
            String(n.booking_id) === q ||
            String(n.notification_id) === q
        );
      }
      if (notificationType.trim()) {
        const t = notificationType.trim().toLowerCase();
        filtered = filtered.filter((n) => n.notification_type.toLowerCase() === t);
      }
      if (readStatus.trim()) {
        const isRead = readStatus === "read";
        filtered = filtered.filter((n) => n.is_read === isRead);
      }
      setNotifications(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setSearchQuery("");
    setNotificationType("");
    setReadStatus("");
    await loadNotifications();
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-description">View your latest notifications.</p>
        </div>
      </div>

      {/* Search / Filter Section */}
      <div className="table-container" style={{ marginBottom: "25px" }}>
        <div className="table-header">Search / Filter Notifications</div>
        <form onSubmit={handleSearch} style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <label htmlFor="filter_search" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Search (Message, Recipient ID, Booking ID)
              </label>
              <input
                id="filter_search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Booking accepted or ID"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label htmlFor="filter_type" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Notification Type
              </label>
              <select
                id="filter_type"
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              >
                <option value="">All Types</option>
                <option value="Booking">Booking</option>
                <option value="Payment">Payment</option>
                <option value="Rating">Rating</option>
                <option value="Dispute">Dispute</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter_read_status" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Read Status
              </label>
              <select
                id="filter_read_status"
                value={readStatus}
                onChange={(e) => setReadStatus(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              >
                <option value="">All Statuses</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
              style={{ padding: "9px 18px", fontSize: "14px" }}
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              style={{
                padding: "9px 18px",
                fontSize: "14px",
                fontWeight: 600,
                background: "white",
                border: "1px solid #d1d5db",
                color: "#374151",
                borderRadius: "7px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="table-container">
        <div className="table-header">All Notifications</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Booking ID</th>
              <th>Recipient</th>
              <th>Type</th>
              <th>Message</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7}>Loading notifications...</td></tr>
            ) : notifications.length === 0 ? (
              <tr><td colSpan={7}>No notifications found.</td></tr>
            ) : (
              notifications.map((n) => (
                <tr key={n.notification_id}>
                  <td>{n.notification_id}</td>
                  <td>
                    <Link href={`/bookings/${n.booking_id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
                      Booking #{n.booking_id}
                    </Link>
                  </td>
                  <td>
                    {n.recipient_type} #{n.recipient_id}
                  </td>
                  <td>{n.notification_type}</td>
                  <td>{n.message}</td>
                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "5px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: n.is_read ? "#f3f4f6" : "#eff6ff",
                        color: n.is_read ? "#6b7280" : "#2563eb",
                      }}
                    >
                      {n.is_read ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td>{n.created_at ?? "Not set"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {error && <div style={{ padding: "14px 20px", color: "#b91c1c", background: "#fee2e2" }}>{error}</div>}
      </div>
    </div>
  );
}
