"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking, getJobs, getWorkers } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export type BookingFormData = { job_id: string; worker_id: string; scheduled_date: string; booking_status: string; final_price: string; completion_date: string };
export type JobOption = { job_id: number; title: string };
export type WorkerOption = { worker_id: number; full_name: string };

export default function NewBookingPage() {
  const router = useRouter();
  const showToast = useToast();
  const [formData, setFormData] = useState<BookingFormData>({ job_id: "", worker_id: "", scheduled_date: "", booking_status: "Pending", final_price: "", completion_date: "" });
  const [jobs, setJobs] = useState<JobOption[]>([]); const [workers, setWorkers] = useState<WorkerOption[]>([]); const [loadingOptions, setLoadingOptions] = useState(true); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  useEffect(() => { Promise.all([getJobs(), getWorkers()]).then(([jobsData, workersData]) => { setJobs(jobsData); setWorkers(workersData); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to load jobs and workers.")).finally(() => setLoadingOptions(false)); }, []);
  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) { const { name, value } = event.target; setFormData((current) => ({ ...current, [name]: value })); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); try { await createBooking({ job_id: Number(formData.job_id), worker_id: Number(formData.worker_id), scheduled_date: formData.scheduled_date, booking_status: formData.booking_status, final_price: formData.final_price === "" ? null : Number(formData.final_price), completion_date: formData.completion_date || null }); showToast("Booking created.", "success"); router.push("/bookings"); } catch (err) { setError(err instanceof Error ? err.message : "Failed to create booking."); } finally { setLoading(false); } }
  if (loadingOptions) return <div className="page-container">Loading jobs and workers...</div>;
  return <BookingForm title="Add New Booking" description="Create a booking for a worker and job." formData={formData} jobs={jobs} workers={workers} error={error} loading={loading} submitLabel="Create Booking" onChange={handleChange} onSubmit={handleSubmit} />;
}

export function BookingForm({ title, description, formData, jobs, workers, error, loading, submitLabel, onChange, onSubmit }: { title: string; description: string; formData: BookingFormData; jobs: JobOption[]; workers: WorkerOption[]; error: string; loading: boolean; submitLabel: string; onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <div className="page-container"><div className="page-header"><h1 className="page-title">{title}</h1><p className="page-description">{description}</p></div><div className="table-container"><div className="table-header">Booking Information</div><form onSubmit={onSubmit} className="form-panel">
    <div className="form-grid">
    <div className="form-group"><label htmlFor="job_id" className="form-label">Job</label><select id="job_id" name="job_id" value={formData.job_id} onChange={onChange} required className="form-input"><option value="">Select a job</option>{jobs.map((job) => <option key={job.job_id} value={job.job_id}>Job {job.job_id} - {job.title}</option>)}</select></div>
    <div className="form-group"><label htmlFor="worker_id" className="form-label">Worker</label><select id="worker_id" name="worker_id" value={formData.worker_id} onChange={onChange} required className="form-input"><option value="">Select a worker</option>{workers.map((worker) => <option key={worker.worker_id} value={worker.worker_id}>Worker {worker.worker_id} - {worker.full_name}</option>)}</select></div>
    <div className="form-group"><label htmlFor="scheduled_date" className="form-label">Scheduled Date</label><input id="scheduled_date" name="scheduled_date" type="date" value={formData.scheduled_date} onChange={onChange} required className="form-input" /></div>
    <div className="form-group"><label htmlFor="booking_status" className="form-label">Booking Status</label><select id="booking_status" name="booking_status" value={formData.booking_status} onChange={onChange} className="form-input"><option value="Pending">Pending</option><option value="Accepted">Accepted</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select></div>
    <div className="form-group"><label htmlFor="final_price" className="form-label">Final Price</label><input id="final_price" name="final_price" type="number" min="0" step="0.01" value={formData.final_price} onChange={onChange} className="form-input" /></div>
    <div className="form-group"><label htmlFor="completion_date" className="form-label">Completion Date</label><input id="completion_date" name="completion_date" type="date" value={formData.completion_date} onChange={onChange} className="form-input" /></div>
    </div>
    {error && <div className="error-banner">{error}</div>}<button type="submit" className="primary-button" disabled={loading}>{loading ? "Saving..." : submitLabel}</button>
  </form></div></div>;
}
