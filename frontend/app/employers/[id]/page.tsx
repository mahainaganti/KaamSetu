"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEmployer } from "@/lib/api";
import { initials, statusVariant } from "@/lib/badge";

type Employer = { employer_id: number; full_name: string; phone: string; email: string; employer_type: string; verification_status: string; location_id: number; created_at: string; updated_at: string };

export default function EmployerDetailsPage() {
  const params = useParams<{ id: string }>();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmployer() {
      try { setError(""); setEmployer(await getEmployer(params.id)); }
      catch (err) { setError(err instanceof Error ? err.message : "Failed to fetch employer."); }
      finally { setLoading(false); }
    }
    if (params.id) loadEmployer();
  }, [params.id]);

  if (loading) return <div className="page-container">Loading employer...</div>;
  if (error) return <div className="page-container"><h1 className="page-title">Employer Details</h1><div className="error-banner">{error}</div></div>;
  if (!employer) return <div className="page-container">Employer not found.</div>;

  const fields: [string, string][] = [
    ["Phone", employer.phone],
    ["Email", employer.email],
    ["Employer Type", employer.employer_type],
    ["Location ID", String(employer.location_id)],
    ["Created At", employer.created_at],
    ["Updated At", employer.updated_at],
  ];

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Employer Details</h1>
          <p className="page-description">Complete information about this employer.</p>
        </div>
        <div className="detail-hero-actions">
          <Link href="/employers" className="btn-secondary">Back to Employers</Link>
          <Link href={`/employers/edit/${employer.employer_id}`} className="primary-button">Edit Employer</Link>
        </div>
      </div>

      <div className="table-container">
        <div className="detail-hero">
          <span className="avatar-chip avatar-chip-lg">{initials(employer.full_name)}</span>
          <div className="detail-hero-body">
            <div className="detail-hero-title">{employer.full_name}</div>
            <div className="detail-hero-subtitle">Employer #{employer.employer_id}</div>
            <div className="detail-hero-badges">
              <span className={`badge ${statusVariant(employer.verification_status)}`}>{employer.verification_status}</span>
              <span className="badge badge-neutral">{employer.employer_type}</span>
            </div>
          </div>
        </div>

        <div className="info-grid">
          {fields.map(([label, value]) => (
            <div className="info-tile" key={label}>
              <div className="info-tile-label">{label}</div>
              <div className="info-tile-value">{value ?? "Not set"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
