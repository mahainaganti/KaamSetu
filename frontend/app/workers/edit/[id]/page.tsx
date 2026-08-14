"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getWorker, updateWorker } from "@/lib/api";

type WorkerForm = {
  full_name: string; phone: string; gender: string; preferred_language: string;
  experience_years: string; travel_radius_km: string; average_rating: string;
  verification_status: string; availability_status: string; location_id: string;
};

const emptyForm: WorkerForm = {
  full_name: "", phone: "", gender: "Female", preferred_language: "",
  experience_years: "", travel_radius_km: "", average_rating: "",
  verification_status: "Pending", availability_status: "Available", location_id: "",
};

export default function EditWorkerPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [formData, setFormData] = useState<WorkerForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWorker() {
      try {
        setError("");
        const worker = await getWorker(params.id);
        setFormData({
          full_name: worker.full_name, phone: worker.phone, gender: worker.gender,
          preferred_language: worker.preferred_language,
          experience_years: String(worker.experience_years),
          travel_radius_km: String(worker.travel_radius_km),
          average_rating: String(worker.average_rating),
          verification_status: worker.verification_status,
          availability_status: worker.availability_status,
          location_id: String(worker.location_id),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch worker.");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadWorker();
  }, [params.id]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateWorker(params.id, {
        full_name: formData.full_name, phone: formData.phone, gender: formData.gender,
        preferred_language: formData.preferred_language,
        experience_years: Number(formData.experience_years),
        travel_radius_km: Number(formData.travel_radius_km),
        average_rating: Number(formData.average_rating),
        verification_status: formData.verification_status,
        availability_status: formData.availability_status,
        location_id: Number(formData.location_id),
      });
      router.push(`/workers/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update worker.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page-container">Loading worker...</div>;

  return (
    <div className="page-container">
      <div className="page-header"><h1 className="page-title">Edit Worker</h1><p className="page-description">Update this worker&apos;s registered information.</p></div>
      <div className="table-container">
        <div className="table-header">Worker Information</div>
        <form onSubmit={handleSubmit} style={{ padding: "25px" }}>
          {error && <div style={{ marginBottom: "20px", padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "7px" }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
            <Field label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} />
            <Field label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
            <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Female", "Male", "Other"]} />
            <Field label="Preferred Language" name="preferred_language" value={formData.preferred_language} onChange={handleChange} />
            <Field label="Experience (Years)" name="experience_years" type="number" min="0" value={formData.experience_years} onChange={handleChange} />
            <Field label="Travel Radius (km)" name="travel_radius_km" type="number" min="0" value={formData.travel_radius_km} onChange={handleChange} />
            <Field label="Average Rating" name="average_rating" type="number" min="0" step="0.1" value={formData.average_rating} onChange={handleChange} />
            <Select label="Verification Status" name="verification_status" value={formData.verification_status} onChange={handleChange} options={["Pending", "Verified", "Rejected"]} />
            <Select label="Availability Status" name="availability_status" value={formData.availability_status} onChange={handleChange} options={["Available", "Busy", "Unavailable"]} />
            <Field label="Location ID" name="location_id" type="number" min="1" value={formData.location_id} onChange={handleChange} />
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "25px" }}>
            <button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            <button type="button" onClick={() => router.back()} disabled={saving} style={{ padding: "11px 18px", border: "1px solid #d1d5db", borderRadius: "7px", background: "white", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
type FieldProps = { label: string; name: keyof WorkerForm; value: string; onChange: ChangeHandler; type?: string; min?: string; step?: string };

function Field({ label, name, value, onChange, type = "text", min, step }: FieldProps) {
  return <div><label htmlFor={name} style={{ display: "block", marginBottom: "7px", fontWeight: 600 }}>{label}</label><input id={name} name={name} type={type} min={min} step={step} value={value} onChange={onChange} required style={{ width: "100%", padding: "11px", border: "1px solid #d1d5db", borderRadius: "7px" }} /></div>;
}

function Select({ label, name, value, onChange, options }: { label: string; name: keyof WorkerForm; value: string; onChange: ChangeHandler; options: string[] }) {
  return <div><label htmlFor={name} style={{ display: "block", marginBottom: "7px", fontWeight: 600 }}>{label}</label><select id={name} name={name} value={value} onChange={onChange} style={{ width: "100%", padding: "11px", border: "1px solid #d1d5db", borderRadius: "7px" }}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>;
}
