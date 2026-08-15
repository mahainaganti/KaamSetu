"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployer } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export default function NewEmployerPage() {
  const router = useRouter();
  const showToast = useToast();
  const [formData, setFormData] = useState({ full_name: "", phone: "", email: "", employer_type: "Individual", verification_status: "Pending", location_id: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) { const { name, value } = event.target; setFormData((current) => ({ ...current, [name]: value })); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try { await createEmployer({ ...formData, location_id: Number(formData.location_id) }); showToast(`${formData.full_name} was added.`, "success"); router.push("/employers"); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to create employer."); }
    finally { setLoading(false); }
  }
  return <EmployerForm title="Add New Employer" description="Register a new employer on the KaamSetu platform." formData={formData} error={error} loading={loading} submitLabel="Create Employer" onChange={handleChange} onSubmit={handleSubmit} />;
}

type EmployerFormData = { full_name: string; phone: string; email: string; employer_type: string; verification_status: string; location_id: string };
export function EmployerForm({ title, description, formData, error, loading, submitLabel, onChange, onSubmit }: { title: string; description: string; formData: EmployerFormData; error: string; loading: boolean; submitLabel: string; onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return <div className="page-container"><div className="page-header"><h1 className="page-title">{title}</h1><p className="page-description">{description}</p></div><div className="table-container"><div className="table-header">Employer Information</div><form onSubmit={onSubmit} className="form-panel">
    <div className="form-grid">
      <div className="form-group"><label htmlFor="full_name" className="form-label">Full Name</label><input id="full_name" name="full_name" value={formData.full_name} onChange={onChange} required className="form-input" /></div>
      <div className="form-group"><label htmlFor="phone" className="form-label">Phone</label><input id="phone" name="phone" type="tel" value={formData.phone} onChange={onChange} required className="form-input" /></div>
      <div className="form-group"><label htmlFor="email" className="form-label">Email</label><input id="email" name="email" type="email" value={formData.email} onChange={onChange} required className="form-input" /></div>
      <div className="form-group"><label htmlFor="employer_type" className="form-label">Employer Type</label><select id="employer_type" name="employer_type" value={formData.employer_type} onChange={onChange} className="form-input"><option value="Individual">Individual</option><option value="Household">Household</option><option value="Business">Business</option></select></div>
      <div className="form-group"><label htmlFor="verification_status" className="form-label">Verification Status</label><select id="verification_status" name="verification_status" value={formData.verification_status} onChange={onChange} className="form-input"><option value="Verified">Verified</option><option value="Pending">Pending</option></select></div>
      <div className="form-group"><label htmlFor="location_id" className="form-label">Location ID</label><input id="location_id" name="location_id" type="number" min="1" value={formData.location_id} onChange={onChange} required className="form-input" /></div>
    </div>
    {error && <div className="error-banner">{error}</div>}
    <button type="submit" className="primary-button" disabled={loading}>{loading ? "Saving..." : submitLabel}</button>
  </form></div></div>;
}
