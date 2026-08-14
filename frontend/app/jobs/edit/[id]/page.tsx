"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJob, updateJob } from "@/lib/api";
import { JobForm } from "../../new/page";

type JobFormData = { employer_id: string; title: string; description: string; budget: string; status: string; location_id: string };

export default function EditJobPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<JobFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getJob(params.id)
      .then((job) => {
        setError("");
        setFormData({ employer_id: String(job.employer_id), title: job.title, description: job.description, budget: String(job.budget), status: job.status, location_id: String(job.location_id) });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch job."))
      .finally(() => setLoading(false));
  }, [params.id]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) { const { name, value } = event.target; setFormData((current) => current ? { ...current, [name]: value } : current); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formData) return;
    setSaving(true); setError("");
    try {
      await updateJob(params.id, { employer_id: Number(formData.employer_id), title: formData.title, description: formData.description, budget: Number(formData.budget), status: formData.status, location_id: Number(formData.location_id) });
      router.push(`/jobs/${params.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to update job."); }
    finally { setSaving(false); }
  }
  if (loading) return <div className="page-container">Loading job...</div>;
  if (!formData) return <div className="page-container"><h1 className="page-title">Edit Job</h1><div style={{ marginTop: "20px", padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "7px" }}>{error || "Job not found."}</div></div>;
  return <JobForm title="Edit Job" description="Update this job posting." formData={formData} error={error} loading={saving} submitLabel="Save Changes" onChange={handleChange} onSubmit={handleSubmit} />;
}
