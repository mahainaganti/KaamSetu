"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteBooking, getBookings } from "@/lib/api";
import { statusVariant } from "@/lib/badge";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";
import TableSkeleton from "@/components/TableSkeleton";

type Booking = { booking_id: number; job_id: number; worker_id: number; booking_date: string | null; scheduled_date: string; booking_status: string; final_price: number | null; completion_date: string | null };
const displayValue = (value: string | number | null) => value ?? "Not set";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const confirmAction = useConfirm();
  const showToast = useToast();

  async function loadBookings() { try { const data = await getBookings(); setError(""); setBookings(data); } catch (err) { setError(err instanceof Error ? err.message : "Failed to fetch bookings."); } finally { setLoading(false); } }
  useEffect(() => { getBookings().then((data) => { setError(""); setBookings(data); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch bookings.")).finally(() => setLoading(false)); }, []);

  async function handleDelete(booking: Booking) {
    const confirmed = await confirmAction({
      title: "Delete booking?",
      message: "Are you sure you want to delete this booking? This will also delete related payment, rating, dispute, and notification records.",
      confirmLabel: "Delete Booking",
    });
    if (!confirmed) return;

    setDeletingId(booking.booking_id); setError("");
    try {
      await deleteBooking(String(booking.booking_id));
      await loadBookings();
      showToast(`Booking #${booking.booking_id} was deleted.`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete booking.";
      setError(message);
      showToast(message, "error");
    } finally { setDeletingId(null); }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return bookings;
    return bookings.filter((booking) => String(booking.booking_id).includes(query) || String(booking.job_id).includes(query) || String(booking.worker_id).includes(query));
  }, [bookings, search]);

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-description">Manage worker job bookings.</p>
        </div>
        <Link href="/bookings/new" className="primary-button">+ New Booking</Link>
      </div>
      <div className="table-container">
        <div className="toolbar">
          <div className="search-field">
            <span className="search-field-icon">🔍</span>
            <input type="text" placeholder="Search by booking, job, or worker ID..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search bookings" />
          </div>
          <span className="result-count">{filtered.length} of {bookings.length} bookings</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Booking ID</th><th>Job ID</th><th>Worker ID</th><th>Booking Date</th><th>Scheduled Date</th><th>Status</th><th>Final Price</th><th>Completion Date</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <TableSkeleton columns={9} />
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <span className="empty-state-icon">📅</span>
                    <span className="empty-state-title">No bookings found</span>
                    <span className="empty-state-description">
                      {bookings.length === 0 ? "Create your first booking to get started." : "Try a different search term."}
                    </span>
                  </div>
                </td></tr>
              ) : filtered.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.booking_id}</td>
                  <td>{booking.job_id}</td>
                  <td>{booking.worker_id}</td>
                  <td>{displayValue(booking.booking_date)}</td>
                  <td>{booking.scheduled_date}</td>
                  <td><span className={`badge ${statusVariant(booking.booking_status)}`}>{booking.booking_status}</span></td>
                  <td>{booking.final_price != null ? `₹${booking.final_price}` : "Not set"}</td>
                  <td>{displayValue(booking.completion_date)}</td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/bookings/${booking.booking_id}`} className="action-link view">View</Link>
                      <Link href={`/bookings/edit/${booking.booking_id}`} className="action-link edit">Edit</Link>
                      <button type="button" className="btn-delete" onClick={() => handleDelete(booking)} disabled={deletingId === booking.booking_id}>{deletingId === booking.booking_id ? "Deleting..." : "Delete"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <div className="table-error">{error}</div>}
      </div>
    </div>
  );
}
