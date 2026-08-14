"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBookings, getEmployers, getRating, getWorkers } from "@/lib/api";

type Rating = { rating_id: number; booking_id: number; employer_id: number; worker_id: number; rating: number; review: string | null; rated_at: string | null };

export default function RatingDetailsPage() {
  const params = useParams<{ id: string }>(); const [rating, setRating] = useState<Rating | null>(null); const [bookingText, setBookingText] = useState(""); const [employerText, setEmployerText] = useState(""); const [workerText, setWorkerText] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { Promise.all([getRating(params.id), getBookings(), getEmployers(), getWorkers()]).then(([ratingData, bookings, employers, workers]) => { setRating(ratingData); const booking = bookings.find((item: { booking_id: number }) => item.booking_id === ratingData.booking_id); const employer = employers.find((item: { employer_id: number }) => item.employer_id === ratingData.employer_id); const worker = workers.find((item: { worker_id: number }) => item.worker_id === ratingData.worker_id); setBookingText(booking ? `Booking #${booking.booking_id} - Job #${booking.job_id} - Scheduled: ${booking.scheduled_date}` : `Booking #${ratingData.booking_id}`); setEmployerText(employer ? `${employer.full_name} - ID ${employer.employer_id}` : `Employer #${ratingData.employer_id}`); setWorkerText(worker ? `${worker.full_name} - ID ${worker.worker_id}` : `Worker #${ratingData.worker_id}`); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch rating.")).finally(() => setLoading(false)); }, [params.id]);
  if (loading) return <div className="page-container">Loading rating...</div>;
  if (error) return <div className="page-container"><h1 className="page-title">Rating Details</h1><div style={{ marginTop: "20px", padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "7px" }}>{error}</div></div>;
  if (!rating) return <div className="page-container">Rating not found.</div>;
  const rows: [string, string | number | null][] = [["Rating ID", rating.rating_id], ["Booking", bookingText], ["Employer", employerText], ["Worker", workerText], ["Rating", `${rating.rating}/5`], ["Review", rating.review], ["Rated At", rating.rated_at]];
  return <div className="page-container"><div className="page-header"><h1 className="page-title">Rating Details</h1><p className="page-description">Complete feedback information for this booking.</p></div><div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}><Link href="/ratings" style={{ padding: "11px 18px", border: "1px solid #d1d5db", borderRadius: "7px", background: "white", color: "#1f2937", textDecoration: "none", fontWeight: 600 }}>Back to Ratings</Link><Link href={`/ratings/edit/${rating.rating_id}`} className="primary-button" style={{ textDecoration: "none" }}>Edit Rating</Link></div><div className="table-container"><div className="table-header">Rating Information</div><table><tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value ?? "Not set"}</td></tr>)}</tbody></table></div></div>;
}
