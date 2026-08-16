"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteBooking, getBookings } from "@/lib/api";

type Booking = { booking_id: number; job_id: number; worker_id: number; booking_date: string | null; scheduled_date: string; booking_status: string; final_price: number | null; completion_date: string | null };
const displayValue = (value: string | number | null) => value ?? "Not set";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [bookingStatus, setBookingStatus] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [jobId, setJobId] = useState("");

  async function loadBookings() {
    try {
      const data = await getBookings();
      setError("");
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getBookings()
      .then((data) => {
        setError("");
        setBookings(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch bookings."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data: Booking[] = await getBookings();
      let filtered = data;
      if (bookingStatus.trim()) {
        const s = bookingStatus.trim().toLowerCase();
        filtered = filtered.filter((b) => b.booking_status.toLowerCase() === s);
      }
      if (workerId.trim()) {
        filtered = filtered.filter((b) => String(b.worker_id) === workerId.trim());
      }
      if (jobId.trim()) {
        filtered = filtered.filter((b) => String(b.job_id) === jobId.trim());
      }
      setBookings(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setBookingStatus("");
    setWorkerId("");
    setJobId("");
    await loadBookings();
  }

  async function handleDelete(booking: Booking) {
    if (!window.confirm("Are you sure you want to delete this booking? This will also delete related payment, rating, dispute, and notification records.")) return;
    setDeletingId(booking.booking_id);
    setError("");
    try {
      await deleteBooking(String(booking.booking_id));
      await loadBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete booking.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-description">Manage worker job bookings.</p>
        </div>
        <Link href="/bookings/new" className="primary-button" style={{ textDecoration: "none", display: "inline-block" }}>+ New Booking</Link>
      </div>

      {/* Search / Filter Section */}
      <div className="table-container" style={{ marginBottom: "25px" }}>
        <div className="table-header">Search / Filter Bookings</div>
        <form onSubmit={handleSearch} style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <label htmlFor="filter_status" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Booking Status
              </label>
              <select
                id="filter_status"
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter_worker_id" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Worker ID
              </label>
              <input
                id="filter_worker_id"
                type="number"
                min="1"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                placeholder="e.g. 10"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label htmlFor="filter_job_id" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Job ID
              </label>
              <input
                id="filter_job_id"
                type="number"
                min="1"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="e.g. 1"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              />
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
        <div className="table-header">All Bookings</div>
        <table>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Job ID</th>
              <th>Worker ID</th>
              <th>Booking Date</th>
              <th>Scheduled Date</th>
              <th>Status</th>
              <th>Final Price</th>
              <th>Completion Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9}>Loading bookings...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={9}>No bookings found.</td></tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.booking_id}</td>
                  <td>{booking.job_id}</td>
                  <td>{booking.worker_id}</td>
                  <td>{displayValue(booking.booking_date)}</td>
                  <td>{booking.scheduled_date}</td>
                  <td>{booking.booking_status}</td>
                  <td>{displayValue(booking.final_price)}</td>
                  <td>{displayValue(booking.completion_date)}</td>
                  <td>
                    <Link href={`/bookings/${booking.booking_id}`} style={{ marginRight: "12px", color: "#2563eb", textDecoration: "none" }}>View</Link>
                    <Link href={`/bookings/edit/${booking.booking_id}`} style={{ color: "#16a34a", textDecoration: "none" }}>Edit</Link>
                    <button type="button" onClick={() => handleDelete(booking)} disabled={deletingId === booking.booking_id} style={{ marginLeft: "12px", border: "none", background: "transparent", color: "#dc2626", cursor: deletingId === booking.booking_id ? "not-allowed" : "pointer", fontSize: "13px" }}>{deletingId === booking.booking_id ? "Deleting..." : "Delete"}</button>
                  </td>
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
