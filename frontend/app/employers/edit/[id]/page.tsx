"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEmployer, updateEmployer } from "@/lib/api";
import { EmployerForm } from "../../new/page";
import { useToast } from "@/components/ToastProvider";

type EmployerFormData = { full_name: string; phone: string; email: string; employer_type: string; verification_status: string; location_id: string };

export default function EditEmployerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const showToast = useToast();
  const [formData, setFormData] = useState<EmployerFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmployer() {
      try {
        setError("");
        const employer = await getEmployer(params.id);
        setFormData({ full_name: employer.full_name, phone: employer.phone, email: employer.email, employer_type: employer.employer_type, verification_status: employer.verification_status, location_id: String(employer.location_id) });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch employer.");
      } finally { setLoading(false); }
    }
    if (params.id) loadEmployer();
  }, [params.id]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) { const { name, value } = event.target; setFormData((current) => current ? { ...current, [name]: value } : current); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formData) return;
    setSaving(true); setError("");
    try {
      await updateEmployer(params.id, { ...formData, location_id: Number(formData.location_id) });
      showToast("Employer updated.", "success");
      router.push(`/employers/${params.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to update employer."); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="page-container">Loading employer...</div>;
  if (!formData) return <div className="page-container"><h1 className="page-title">Edit Employer</h1><div className="error-banner">{error || "Employer not found."}</div></div>;
  return <EmployerForm title="Edit Employer" description="Update this employer's registered information." formData={formData} error={error} loading={saving} submitLabel="Save Changes" onChange={handleChange} onSubmit={handleSubmit} />;
}
