"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJob } from "@/lib/api";
import { statusVariant } from "@/lib/badge";

type Job = { job_id: number; employer_id: number; title: string; description: string; budget: number; status: string; location_id: number; posted_at: string };

export default function JobDetailsPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    getJob(params.id).then((jobData) => { setError(""); setJob(jobData); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch job.")).finally(() => setLoading(false));
  }, [params.id]);
  if (loading) return <div className="page-container">Loading job...</div>;
  if (error) return <div className="page-container"><h1 className="page-title">Job Details</h1><div className="error-banner">{error}</div></div>;
  if (!job) return <div className="page-container">Job not found.</div>;

  const fields: [string, string | number][] = [
    ["Employer ID", job.employer_id],
    ["Budget", `₹${job.budget}`],
    ["Location ID", job.location_id],
    ["Posted At", job.posted_at],
  ];

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Job Details</h1>
          <p className="page-description">Complete information about this job.</p>
        </div>
        <div className="detail-hero-actions">
          <Link href="/jobs" className="btn-secondary">Back to Jobs</Link>
          <Link href={`/jobs/edit/${job.job_id}`} className="primary-button">Edit Job</Link>
        </div>
      </div>

      <div className="table-container">
        <div className="detail-hero">
          <span className="avatar-chip avatar-chip-lg">💼</span>
          <div className="detail-hero-body">
            <div className="detail-hero-title">{job.title}</div>
            <div className="detail-hero-subtitle">Job #{job.job_id}</div>
            <div className="detail-hero-badges">
              <span className={`badge ${statusVariant(job.status)}`}>{job.status}</span>
            </div>
          </div>
        </div>

        <div className="detail-description-block">
          <div className="section-title">Description</div>
          <p className="detail-description">{job.description}</p>
        </div>

        <div className="info-grid">
          {fields.map(([label, value]) => (
            <div className="info-tile" key={label}>
              <div className="info-tile-label">{label}</div>
              <div className="info-tile-value">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
