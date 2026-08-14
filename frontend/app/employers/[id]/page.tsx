"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEmployer } from "@/lib/api";

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
  if (error) return <div className="page-container"><h1 className="page-title">Employer Details</h1><div style={{ marginTop: "20px", padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "7px" }}>{error}</div></div>;
  if (!employer) return <div className="page-container">Employer not found.</div>;

  const rows: [string, string | number][] = [
    ["Employer ID", employer.employer_id], ["Full Name", employer.full_name], ["Phone", employer.phone], ["Email", employer.email], ["Employer Type", employer.employer_type], ["Verification Status", employer.verification_status], ["Location ID", employer.location_id], ["Created At", employer.created_at], ["Updated At", employer.updated_at],
  ];
  return <div className="page-container"><div className="page-header"><h1 className="page-title">Employer Details</h1><p className="page-description">Complete information about this employer.</p></div><div className="table-container"><div className="table-header">Employer Information</div><table><tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value}</td></tr>)}</tbody></table></div></div>;
}
