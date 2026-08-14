"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployer } from "@/lib/api";

export default function NewEmployerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ full_name: "", phone: "", email: "", employer_type: "Individual", verification_status: "Pending", location_id: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) { const { name, value } = event.target; setFormData((current) => ({ ...current, [name]: value })); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try { await createEmployer({ ...formData, location_id: Number(formData.location_id) }); router.push("/employers"); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to create employer."); }
    finally { setLoading(false); }
  }
  return <EmployerForm title="Add New Employer" description="Register a new employer on the KaamSetu platform." formData={formData} error={error} loading={loading} submitLabel="Create Employer" onChange={handleChange} onSubmit={handleSubmit} />;
}

type EmployerFormData = { full_name: string; phone: string; email: string; employer_type: string; verification_status: string; location_id: string };
export function EmployerForm({ title, description, formData, error, loading, submitLabel, onChange, onSubmit }: { title: string; description: string; formData: EmployerFormData; error: string; loading: boolean; submitLabel: string; onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  const inputStyle = { width: "100%", padding: "11px", border: "1px solid #d1d5db", borderRadius: "7px" };
  const fieldStyle = { marginBottom: "20px" };
  const labelStyle = { display: "block", marginBottom: "7px", fontWeight: 600 } as const;
  return <div className="page-container"><div className="page-header"><h1 className="page-title">{title}</h1><p className="page-description">{description}</p></div><div className="table-container"><div className="table-header">Employer Information</div><form onSubmit={onSubmit} style={{ padding: "25px" }}>
    <div style={fieldStyle}><label htmlFor="full_name" style={labelStyle}>Full Name</label><input id="full_name" name="full_name" value={formData.full_name} onChange={onChange} required style={inputStyle} /></div>
    <div style={fieldStyle}><label htmlFor="phone" style={labelStyle}>Phone</label><input id="phone" name="phone" type="tel" value={formData.phone} onChange={onChange} required style={inputStyle} /></div>
    <div style={fieldStyle}><label htmlFor="email" style={labelStyle}>Email</label><input id="email" name="email" type="email" value={formData.email} onChange={onChange} required style={inputStyle} /></div>
    <div style={fieldStyle}><label htmlFor="employer_type" style={labelStyle}>Employer Type</label><select id="employer_type" name="employer_type" value={formData.employer_type} onChange={onChange} style={inputStyle}><option value="Individual">Individual</option><option value="Household">Household</option><option value="Business">Business</option></select></div>
    <div style={fieldStyle}><label htmlFor="verification_status" style={labelStyle}>Verification Status</label><select id="verification_status" name="verification_status" value={formData.verification_status} onChange={onChange} style={inputStyle}><option value="Verified">Verified</option><option value="Pending">Pending</option></select></div>
    <div style={fieldStyle}><label htmlFor="location_id" style={labelStyle}>Location ID</label><input id="location_id" name="location_id" type="number" min="1" value={formData.location_id} onChange={onChange} required style={inputStyle} /></div>
    {error && <div style={{ marginBottom: "20px", padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "7px" }}>{error}</div>}
    <button type="submit" className="primary-button" disabled={loading}>{loading ? "Saving..." : submitLabel}</button>
  </form></div></div>;
}
