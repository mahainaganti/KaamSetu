"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBooking, getJobs, getWorkers, updateBooking } from "@/lib/api";
import { BookingForm, BookingFormData, JobOption, WorkerOption } from "../../new/page";

export default function EditBookingPage() {
  const params = useParams<{ id: string }>(); const router = useRouter(); const [formData, setFormData] = useState<BookingFormData | null>(null); const [jobs, setJobs] = useState<JobOption[]>([]); const [workers, setWorkers] = useState<WorkerOption[]>([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  useEffect(() => { Promise.all([getBooking(params.id), getJobs(), getWorkers()]).then(([booking, jobsData, workersData]) => { setError(""); setJobs(jobsData); setWorkers(workersData); setFormData({ job_id: String(booking.job_id), worker_id: String(booking.worker_id), scheduled_date: booking.scheduled_date, booking_status: booking.booking_status, final_price: booking.final_price === null ? "" : String(booking.final_price), completion_date: booking.completion_date || "" }); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to load booking information.")).finally(() => setLoading(false)); }, [params.id]);
  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) { const { name, value } = event.target; setFormData((current) => current ? { ...current, [name]: value } : current); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!formData) return; setSaving(true); setError(""); try { await updateBooking(params.id, { job_id: Number(formData.job_id), worker_id: Number(formData.worker_id), scheduled_date: formData.scheduled_date, booking_status: formData.booking_status, final_price: formData.final_price === "" ? null : Number(formData.final_price), completion_date: formData.completion_date || null }); router.push(`/bookings/${params.id}`); } catch (err) { setError(err instanceof Error ? err.message : "Failed to update booking."); } finally { setSaving(false); } }
  if (loading) return <div className="page-container">Loading booking, jobs, and workers...</div>;
  if (!formData) return <div className="page-container"><h1 className="page-title">Edit Booking</h1><div style={{ marginTop: "20px", padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "7px" }}>{error || "Booking not found."}</div></div>;
  return <BookingForm title="Edit Booking" description="Update this booking." formData={formData} jobs={jobs} workers={workers} error={error} loading={saving} submitLabel="Save Changes" onChange={handleChange} onSubmit={handleSubmit} />;
}
