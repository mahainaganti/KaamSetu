"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBooking } from "@/lib/api";
import { statusVariant } from "@/lib/badge";

type Booking = { booking_id: number; job_id: number; worker_id: number; booking_date: string | null; scheduled_date: string; booking_status: string; final_price: number | null; completion_date: string | null };
const displayValue = (value: string | number | null) => value ?? "Not set";

export default function BookingDetailsPage() {
  const params = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { getBooking(params.id).then((data) => { setError(""); setBooking(data); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch booking.")).finally(() => setLoading(false)); }, [params.id]);
  if (loading) return <div className="page-container">Loading booking...</div>;
  if (error) return <div className="page-container"><h1 className="page-title">Booking Details</h1><div className="error-banner">{error}</div></div>;
  if (!booking) return <div className="page-container">Booking not found.</div>;

  const fields: [string, string | number | null][] = [
    ["Job ID", booking.job_id],
    ["Worker ID", booking.worker_id],
    ["Booking Date", booking.booking_date],
    ["Scheduled Date", booking.scheduled_date],
    ["Final Price", booking.final_price != null ? `₹${booking.final_price}` : null],
    ["Completion Date", booking.completion_date],
  ];

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Booking Details</h1>
          <p className="page-description">Complete information about this booking.</p>
        </div>
        <div className="detail-hero-actions">
          <Link href="/bookings" className="btn-secondary">Back to Bookings</Link>
          <Link href={`/bookings/edit/${booking.booking_id}`} className="primary-button">Edit Booking</Link>
        </div>
      </div>

      <div className="table-container">
        <div className="detail-hero">
          <span className="avatar-chip avatar-chip-lg">📅</span>
          <div className="detail-hero-body">
            <div className="detail-hero-title">Booking #{booking.booking_id}</div>
            <div className="detail-hero-subtitle">Job #{booking.job_id} · Worker #{booking.worker_id}</div>
            <div className="detail-hero-badges">
              <span className={`badge ${statusVariant(booking.booking_status)}`}>{booking.booking_status}</span>
            </div>
          </div>
        </div>

        <div className="info-grid">
          {fields.map(([label, value]) => (
            <div className="info-tile" key={label}>
              <div className="info-tile-label">{label}</div>
              <div className="info-tile-value">{displayValue(value)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
