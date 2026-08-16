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

  const [titleQuery, setTitleQuery] = useState("");
  const [status, setStatus] = useState("");
  const [locationId, setLocationId] = useState("");

  async function loadJobs() {
    try {
      const jobsData = await getJobs();
      setError("");
      setJobs(jobsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch jobs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getJobs()
      .then((jobsData) => {
        setError("");
        setJobs(jobsData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch jobs."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data: Job[] = await getJobs();
      let filtered = data;
      if (titleQuery.trim()) {
        const q = titleQuery.trim().toLowerCase();
        filtered = filtered.filter((job) => job.title.toLowerCase().includes(q));
      }
      if (status.trim()) {
        const s = status.trim().toLowerCase();
        filtered = filtered.filter((job) => job.status.toLowerCase() === s);
      }
      if (locationId.trim()) {
        filtered = filtered.filter((job) => String(job.location_id) === locationId.trim());
      }
      setJobs(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search jobs.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setTitleQuery("");
    setStatus("");
    setLocationId("");
    await loadJobs();
  }

  async function handleDelete(job: Job) {
    if (!window.confirm("Are you sure you want to delete this job? This may also delete related bookings and job skills.")) return;
    setDeletingId(job.job_id);
    setError("");
    try {
      await deleteJob(String(job.job_id));
      await loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Jobs</h1>
          <p className="page-description">Find and manage posted jobs.</p>
        </div>
        <Link href="/jobs/new" className="primary-button" style={{ textDecoration: "none", display: "inline-block" }}>+ New Job</Link>
      </div>

      {/* Search / Filter Section */}
      <div className="table-container" style={{ marginBottom: "25px" }}>
        <div className="table-header">Search / Filter Jobs</div>
        <form onSubmit={handleSearch} style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <label htmlFor="filter_title" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Job Title
              </label>
              <input
                id="filter_title"
                type="text"
                value={titleQuery}
                onChange={(e) => setTitleQuery(e.target.value)}
                placeholder="e.g. Electrician"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label htmlFor="filter_status" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Status
              </label>
              <select
                id="filter_status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter_location_id" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Location ID
              </label>
              <input
                id="filter_location_id"
                type="number"
                min="1"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                placeholder="e.g. 15"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button
              type="submit"
              className="primary-button"
              disabled={loading}
              style={{ padding: "9px 18px", fontSize: "14px" }}
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              style={{
                padding: "9px 18px",
                fontSize: "14px",
                fontWeight: 600,
                background: "white",
                border: "1px solid #d1d5db",
                color: "#374151",
                borderRadius: "7px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="table-container">
        <div className="table-header">All Jobs</div>
        <table>
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Employer ID</th>
              <th>Title</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Location ID</th>
              <th>Posted At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}>Loading jobs...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={8}>No jobs found.</td></tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.job_id}>
                  <td>{job.job_id}</td>
                  <td>{job.employer_id}</td>
                  <td><Link href={`/jobs/${job.job_id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>{job.title}</Link></td>
                  <td>{job.budget}</td>
                  <td>{job.status}</td>
                  <td>{job.location_id}</td>
                  <td>{job.posted_at}</td>
                  <td>
                    <Link href={`/jobs/${job.job_id}`} style={{ marginRight: "12px", color: "#2563eb", textDecoration: "none" }}>View</Link>
                    <Link href={`/jobs/edit/${job.job_id}`} style={{ color: "#16a34a", textDecoration: "none" }}>Edit</Link>
                    <button type="button" onClick={() => handleDelete(job)} disabled={deletingId === job.job_id} style={{ marginLeft: "12px", border: "none", background: "transparent", color: "#dc2626", cursor: deletingId === job.job_id ? "not-allowed" : "pointer", fontSize: "13px" }}>{deletingId === job.job_id ? "Deleting..." : "Delete"}</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {error && <div style={{ padding: "14px 20px", color: "#b91c1c", background: "#fee2e2" }}>{error}</div>}
      </div>
    </div>
  );
}
