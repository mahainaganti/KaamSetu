"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteJob, getJobs } from "@/lib/api";
import { statusVariant } from "@/lib/badge";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";
import TableSkeleton from "@/components/TableSkeleton";

type Job = { job_id: number; employer_id: number; title: string; budget: number; status: string; location_id: number; posted_at: string };

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const confirmAction = useConfirm();
  const showToast = useToast();

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
    const confirmed = await confirmAction({
      title: "Delete job?",
      message: "Are you sure you want to delete this job? This may also delete related bookings and job skills.",
      confirmLabel: "Delete Job",
    });
    if (!confirmed) return;

    setDeletingId(job.job_id); setError("");
    try {
      await deleteJob(String(job.job_id));
      await loadJobs();
      showToast(`"${job.title}" was deleted.`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete job.";
      setError(message);
      showToast(message, "error");
    } finally { setDeletingId(null); }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return jobs;
    return jobs.filter((job) => job.title.toLowerCase().includes(query));
  }, [jobs, search]);

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Jobs</h1>
          <p className="page-description">Find and manage posted jobs.</p>
        </div>
        <Link href="/jobs/new" className="primary-button">+ New Job</Link>
      </div>
      <div className="table-container">
        <div className="toolbar">
          <div className="search-field">
            <span className="search-field-icon">🔍</span>
            <input type="text" placeholder="Search by job title..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search jobs" />
          </div>
          <span className="result-count">{filtered.length} of {jobs.length} jobs</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Job ID</th><th>Employer ID</th><th>Title</th><th>Budget</th><th>Status</th><th>Location ID</th><th>Posted At</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <TableSkeleton columns={8} />
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <span className="empty-state-icon">💼</span>
                    <span className="empty-state-title">No jobs found</span>
                    <span className="empty-state-description">
                      {jobs.length === 0 ? "Post your first job to get started." : "Try a different search term."}
                    </span>
                  </div>
                </td></tr>
              ) : filtered.map((job) => (
                <tr key={job.job_id}>
                  <td>{job.job_id}</td>
                  <td>{job.employer_id}</td>
                  <td><Link href={`/jobs/${job.job_id}`} className="link-primary">{job.title}</Link></td>
                  <td>₹{job.budget}</td>
                  <td><span className={`badge ${statusVariant(job.status)}`}>{job.status}</span></td>
                  <td>{job.location_id}</td>
                  <td>{job.posted_at}</td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/jobs/${job.job_id}`} className="action-link view">View</Link>
                      <Link href={`/jobs/edit/${job.job_id}`} className="action-link edit">Edit</Link>
                      <button type="button" className="btn-delete" onClick={() => handleDelete(job)} disabled={deletingId === job.job_id}>{deletingId === job.job_id ? "Deleting..." : "Delete"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <div className="table-error">{error}</div>}
      </div>
    </div>
  );
}
