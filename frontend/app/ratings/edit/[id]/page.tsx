"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBookings, getEmployers, getRating, getWorkers, updateRating } from "@/lib/api";
import { BookingOption, EmployerOption, RatingForm, RatingFormData, WorkerOption } from "../../new/page";

export default function EditRatingPage() {
  const params = useParams<{ id: string }>(); const router = useRouter(); const [formData, setFormData] = useState<RatingFormData | null>(null); const [bookings, setBookings] = useState<BookingOption[]>([]); const [employers, setEmployers] = useState<EmployerOption[]>([]); const [workers, setWorkers] = useState<WorkerOption[]>([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  useEffect(() => { Promise.all([getRating(params.id), getBookings(), getEmployers(), getWorkers()]).then(([rating, bookingsData, employersData, workersData]) => { setError(""); setBookings(bookingsData); setEmployers(employersData); setWorkers(workersData); setFormData({ booking_id: String(rating.booking_id), employer_id: String(rating.employer_id), worker_id: String(rating.worker_id), rating: String(rating.rating), review: rating.review || "" }); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to load rating information.")).finally(() => setLoading(false)); }, [params.id]);
  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) { const { name, value } = event.target; setFormData((current) => current ? { ...current, [name]: value } : current); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!formData) return; setSaving(true); setError(""); try { await updateRating(params.id, { booking_id: Number(formData.booking_id), employer_id: Number(formData.employer_id), worker_id: Number(formData.worker_id), rating: Number(formData.rating), review: formData.review || null }); router.push(`/ratings/${params.id}`); } catch (err) { setError(err instanceof Error ? err.message : "Failed to update rating."); } finally { setSaving(false); } }
  if (loading) return <div className="page-container">Loading rating, bookings, employers, and workers...</div>;
  if (!formData) return <div className="page-container"><h1 className="page-title">Edit Rating</h1><div style={{ marginTop: "20px", padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "7px" }}>{error || "Rating not found."}</div></div>;
  return <RatingForm title="Edit Rating" description="Update this booking feedback." formData={formData} bookings={bookings} employers={employers} workers={workers} error={error} loading={saving} submitLabel="Save Changes" onChange={handleChange} onSubmit={handleSubmit} />;
}
