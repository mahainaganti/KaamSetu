"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteJob, getJobs } from "@/lib/api";

type Job = { job_id: number; employer_id: number; title: string; budget: number; status: string; location_id: number; posted_at: string };

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadJobs() {
    try {
      const jobsData = await getJobs();
      setError("");
      setJobs(jobsData);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to fetch jobs."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    getJobs()
      .then((jobsData) => { setError(""); setJobs(jobsData); })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch jobs."))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(job: Job) {
    if (!window.confirm("Are you sure you want to delete this job? This may also delete related bookings and job skills.")) return;
    setDeletingId(job.job_id); setError("");
    try { await deleteJob(String(job.job_id)); await loadJobs(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete job."); }
    finally { setDeletingId(null); }
  }

  return <div className="page-container"><div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><h1 className="page-title">Jobs</h1><p className="page-description">Find and manage posted jobs.</p></div><Link href="/jobs/new" className="primary-button" style={{ textDecoration: "none", display: "inline-block" }}>+ New Job</Link></div><div className="table-container"><div className="table-header">All Jobs</div><table><thead><tr><th>Job ID</th><th>Employer ID</th><th>Title</th><th>Budget</th><th>Status</th><th>Location ID</th><th>Posted At</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan={8}>Loading jobs...</td></tr> : jobs.length === 0 ? <tr><td colSpan={8}>No jobs found.</td></tr> : jobs.map((job) => <tr key={job.job_id}><td>{job.job_id}</td><td>{job.employer_id}</td><td><Link href={`/jobs/${job.job_id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>{job.title}</Link></td><td>{job.budget}</td><td>{job.status}</td><td>{job.location_id}</td><td>{job.posted_at}</td><td><Link href={`/jobs/${job.job_id}`} style={{ marginRight: "12px", color: "#2563eb", textDecoration: "none" }}>View</Link><Link href={`/jobs/edit/${job.job_id}`} style={{ color: "#16a34a", textDecoration: "none" }}>Edit</Link><button type="button" onClick={() => handleDelete(job)} disabled={deletingId === job.job_id} style={{ marginLeft: "12px", border: "none", background: "transparent", color: "#dc2626", cursor: deletingId === job.job_id ? "not-allowed" : "pointer", fontSize: "13px" }}>{deletingId === job.job_id ? "Deleting..." : "Delete"}</button></td></tr>)}</tbody></table>{error && <div style={{ padding: "14px 20px", color: "#b91c1c", background: "#fee2e2" }}>{error}</div>}</div></div>;
}
