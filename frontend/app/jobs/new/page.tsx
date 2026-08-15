"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

type JobFormData = { employer_id: string; title: string; description: string; budget: string; status: string; location_id: string };

export default function NewJobPage() {
  const router = useRouter();
  const showToast = useToast();
  const [formData, setFormData] = useState<JobFormData>({ employer_id: "", title: "", description: "", budget: "", status: "Open", location_id: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) { const { name, value } = event.target; setFormData((current) => ({ ...current, [name]: value })); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try { await createJob({ employer_id: Number(formData.employer_id), title: formData.title, description: formData.description, budget: Number(formData.budget), status: formData.status, location_id: Number(formData.location_id) }); showToast(`"${formData.title}" was posted.`, "success"); router.push("/jobs"); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to create job."); }
    finally { setLoading(false); }
  }
  return <JobForm title="Add New Job" description="Create a new job posting on the KaamSetu platform." formData={formData} error={error} loading={loading} submitLabel="Create Job" onChange={handleChange} onSubmit={handleSubmit} />;
}

export function JobForm({ title, description, formData, error, loading, submitLabel, onChange, onSubmit }: { title: string; description: string; formData: JobFormData; error: string; loading: boolean; submitLabel: string; onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <div className="page-container"><div className="page-header"><h1 className="page-title">{title}</h1><p className="page-description">{description}</p></div><div className="table-container"><div className="table-header">Job Information</div><form onSubmit={onSubmit} className="form-panel">
    <div className="form-grid">
    <div className="form-group"><label htmlFor="employer_id" className="form-label">Employer ID</label><input id="employer_id" name="employer_id" type="number" min="1" value={formData.employer_id} onChange={onChange} required className="form-input" /></div>
    <div className="form-group"><label htmlFor="title" className="form-label">Title</label><input id="title" name="title" value={formData.title} onChange={onChange} required className="form-input" /></div>
    <div className="form-group"><label htmlFor="description" className="form-label">Description</label><textarea id="description" name="description" value={formData.description} onChange={onChange} required rows={4} className="form-input" /></div>
    <div className="form-group"><label htmlFor="budget" className="form-label">Budget</label><input id="budget" name="budget" type="number" min="0.01" step="0.01" value={formData.budget} onChange={onChange} required className="form-input" /></div>
    <div className="form-group"><label htmlFor="status" className="form-label">Status</label><select id="status" name="status" value={formData.status} onChange={onChange} className="form-input"><option value="Open">Open</option><option value="Assigned">Assigned</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select></div>
    <div className="form-group"><label htmlFor="location_id" className="form-label">Location ID</label><input id="location_id" name="location_id" type="number" min="1" value={formData.location_id} onChange={onChange} required className="form-input" /></div>
    </div>
    {error && <div className="error-banner">{error}</div>}<button type="submit" className="primary-button" disabled={loading}>{loading ? "Saving..." : submitLabel}</button>
  </form></div></div>;
}
