"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteBooking, getBookings } from "@/lib/api";

type Booking = { booking_id: number; job_id: number; worker_id: number; booking_date: string | null; scheduled_date: string; booking_status: string; final_price: number | null; completion_date: string | null };
const displayValue = (value: string | number | null) => value ?? "Not set";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [deletingId, setDeletingId] = useState<number | null>(null);
  async function loadBookings() { try { const data = await getBookings(); setError(""); setBookings(data); } catch (err) { setError(err instanceof Error ? err.message : "Failed to fetch bookings."); } finally { setLoading(false); } }
  useEffect(() => { getBookings().then((data) => { setError(""); setBookings(data); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch bookings.")).finally(() => setLoading(false)); }, []);
  async function handleDelete(booking: Booking) {
    if (!window.confirm("Are you sure you want to delete this booking? This will also delete related payment, rating, dispute, and notification records.")) return;
    setDeletingId(booking.booking_id); setError("");
    try { await deleteBooking(String(booking.booking_id)); await loadBookings(); } catch (err) { setError(err instanceof Error ? err.message : "Failed to delete booking."); } finally { setDeletingId(null); }
  }
  return <div className="page-container"><div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><h1 className="page-title">Bookings</h1><p className="page-description">Manage worker job bookings.</p></div><Link href="/bookings/new" className="primary-button" style={{ textDecoration: "none", display: "inline-block" }}>+ New Booking</Link></div><div className="table-container"><div className="table-header">All Bookings</div><table><thead><tr><th>Booking ID</th><th>Job ID</th><th>Worker ID</th><th>Booking Date</th><th>Scheduled Date</th><th>Status</th><th>Final Price</th><th>Completion Date</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan={9}>Loading bookings...</td></tr> : bookings.length === 0 ? <tr><td colSpan={9}>No bookings found.</td></tr> : bookings.map((booking) => <tr key={booking.booking_id}><td>{booking.booking_id}</td><td>{booking.job_id}</td><td>{booking.worker_id}</td><td>{displayValue(booking.booking_date)}</td><td>{booking.scheduled_date}</td><td>{booking.booking_status}</td><td>{displayValue(booking.final_price)}</td><td>{displayValue(booking.completion_date)}</td><td><Link href={`/bookings/${booking.booking_id}`} style={{ marginRight: "12px", color: "#2563eb", textDecoration: "none" }}>View</Link><Link href={`/bookings/edit/${booking.booking_id}`} style={{ color: "#16a34a", textDecoration: "none" }}>Edit</Link><button type="button" onClick={() => handleDelete(booking)} disabled={deletingId === booking.booking_id} style={{ marginLeft: "12px", border: "none", background: "transparent", color: "#dc2626", cursor: deletingId === booking.booking_id ? "not-allowed" : "pointer", fontSize: "13px" }}>{deletingId === booking.booking_id ? "Deleting..." : "Delete"}</button></td></tr>)}</tbody></table>{error && <div style={{ padding: "14px 20px", color: "#b91c1c", background: "#fee2e2" }}>{error}</div>}</div></div>;
}
