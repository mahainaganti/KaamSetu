"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBooking } from "@/lib/api";

type Booking = { booking_id: number; job_id: number; worker_id: number; booking_date: string | null; scheduled_date: string; booking_status: string; final_price: number | null; completion_date: string | null };
const displayValue = (value: string | number | null) => value ?? "Not set";

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>(); const [booking, setBooking] = useState<Booking | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { getBooking(params.id).then((data) => { setError(""); setBooking(data); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch booking.")).finally(() => setLoading(false)); }, [params.id]);
  if (loading) return <div className="page-container">Loading booking...</div>;
  if (error) return <div className="page-container"><h1 className="page-title">Booking Details</h1><div style={{ marginTop: "20px", padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "7px" }}>{error}</div></div>;
  if (!booking) return <div className="page-container">Booking not found.</div>;
  const rows: [string, string | number | null][] = [["Booking ID", booking.booking_id], ["Job ID", booking.job_id], ["Worker ID", booking.worker_id], ["Booking Date", booking.booking_date], ["Scheduled Date", booking.scheduled_date], ["Booking Status", booking.booking_status], ["Final Price", booking.final_price], ["Completion Date", booking.completion_date]];
  return <div className="page-container"><div className="page-header"><h1 className="page-title">Booking Details</h1><p className="page-description">Complete information about this booking.</p></div><div className="table-container"><div className="table-header">Booking Information</div><table><tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th><td>{displayValue(value)}</td></tr>)}</tbody></table></div></div>;
}
