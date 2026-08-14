"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJob } from "@/lib/api";

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
  if (error) return <div className="page-container"><h1 className="page-title">Job Details</h1><div style={{ marginTop: "20px", padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "7px" }}>{error}</div></div>;
  if (!job) return <div className="page-container">Job not found.</div>;
  const rows: [string, string | number][] = [["Job ID", job.job_id], ["Employer ID", job.employer_id], ["Title", job.title], ["Description", job.description], ["Budget", job.budget], ["Status", job.status], ["Location ID", job.location_id], ["Posted At", job.posted_at]];
  return <div className="page-container"><div className="page-header"><h1 className="page-title">Job Details</h1><p className="page-description">Complete information about this job.</p></div><div className="table-container"><div className="table-header">Job Information</div><table><tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value}</td></tr>)}</tbody></table></div></div>;
}
