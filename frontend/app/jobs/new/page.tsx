"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/lib/api";

type JobFormData = { employer_id: string; title: string; description: string; budget: string; status: string; location_id: string };

export default function NewJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<JobFormData>({ employer_id: "", title: "", description: "", budget: "", status: "Open", location_id: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) { const { name, value } = event.target; setFormData((current) => ({ ...current, [name]: value })); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try { await createJob({ employer_id: Number(formData.employer_id), title: formData.title, description: formData.description, budget: Number(formData.budget), status: formData.status, location_id: Number(formData.location_id) }); router.push("/jobs"); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to create job."); }
    finally { setLoading(false); }
  }
  return <JobForm title="Add New Job" description="Create a new job posting on the KaamSetu platform." formData={formData} error={error} loading={loading} submitLabel="Create Job" onChange={handleChange} onSubmit={handleSubmit} />;
}

export function JobForm({ title, description, formData, error, loading, submitLabel, onChange, onSubmit }: { title: string; description: string; formData: JobFormData; error: string; loading: boolean; submitLabel: string; onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const inputStyle = { width: "100%", padding: "11px", border: "1px solid #d1d5db", borderRadius: "7px" };
  const fieldStyle = { marginBottom: "20px" };
  const labelStyle = { display: "block", marginBottom: "7px", fontWeight: 600 } as const;
  return <div className="page-container"><div className="page-header"><h1 className="page-title">{title}</h1><p className="page-description">{description}</p></div><div className="table-container"><div className="table-header">Job Information</div><form onSubmit={onSubmit} style={{ padding: "25px" }}>
    <div style={fieldStyle}><label htmlFor="employer_id" style={labelStyle}>Employer ID</label><input id="employer_id" name="employer_id" type="number" min="1" value={formData.employer_id} onChange={onChange} required style={inputStyle} /></div>
    <div style={fieldStyle}><label htmlFor="title" style={labelStyle}>Title</label><input id="title" name="title" value={formData.title} onChange={onChange} required style={inputStyle} /></div>
    <div style={fieldStyle}><label htmlFor="description" style={labelStyle}>Description</label><textarea id="description" name="description" value={formData.description} onChange={onChange} required rows={4} style={inputStyle} /></div>
    <div style={fieldStyle}><label htmlFor="budget" style={labelStyle}>Budget</label><input id="budget" name="budget" type="number" min="0.01" step="0.01" value={formData.budget} onChange={onChange} required style={inputStyle} /></div>
    <div style={fieldStyle}><label htmlFor="status" style={labelStyle}>Status</label><select id="status" name="status" value={formData.status} onChange={onChange} style={inputStyle}><option value="Open">Open</option><option value="Assigned">Assigned</option><option value="Completed">Completed</option><option value="Cancelled">Cancelled</option></select></div>
    <div style={fieldStyle}><label htmlFor="location_id" style={labelStyle}>Location ID</label><input id="location_id" name="location_id" type="number" min="1" value={formData.location_id} onChange={onChange} required style={inputStyle} /></div>
    {error && <div style={{ marginBottom: "20px", padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "7px" }}>{error}</div>}<button type="submit" className="primary-button" disabled={loading}>{loading ? "Saving..." : submitLabel}</button>
  </form></div></div>;
}
