"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteEmployer, getEmployers } from "@/lib/api";

type Employer = { employer_id: number; full_name: string; phone: string; email: string; employer_type: string; verification_status: string; location_id: number };

export default function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadEmployers() {
    try {
      const employersData = await getEmployers();
      setError("");
      setEmployers(employersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch employers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getEmployers()
      .then((employersData) => {
        setError("");
        setEmployers(employersData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch employers."))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(employer: Employer) {
    if (!window.confirm(`Delete ${employer.full_name}? This action cannot be undone.`)) return;
    setDeletingId(employer.employer_id);
    setError("");
    try {
      await deleteEmployer(String(employer.employer_id));
      await loadEmployers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete employer.");
    } finally {
      setDeletingId(null);
    }
  }

  return <div className="page-container">
    <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div><h1 className="page-title">Employers</h1><p className="page-description">Find and manage registered employers.</p></div>
      <Link href="/employers/new" className="primary-button" style={{ textDecoration: "none", display: "inline-block" }}>+ New Employer</Link>
    </div>
    <div className="table-container">
      <div className="table-header">All Employers</div>
      <table><thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Type</th><th>Verification</th><th>Location ID</th><th>Actions</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan={8}>Loading employers...</td></tr> : employers.length === 0 ? <tr><td colSpan={8}>No employers found.</td></tr> : employers.map((employer) => <tr key={employer.employer_id}>
          <td>{employer.employer_id}</td><td><Link href={`/employers/${employer.employer_id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>{employer.full_name}</Link></td><td>{employer.phone}</td><td>{employer.email}</td><td>{employer.employer_type}</td><td>{employer.verification_status}</td><td>{employer.location_id}</td>
          <td><Link href={`/employers/${employer.employer_id}`} style={{ marginRight: "12px", color: "#2563eb", textDecoration: "none" }}>View</Link><Link href={`/employers/edit/${employer.employer_id}`} style={{ color: "#16a34a", textDecoration: "none" }}>Edit</Link><button type="button" onClick={() => handleDelete(employer)} disabled={deletingId === employer.employer_id} style={{ marginLeft: "12px", border: "none", background: "transparent", color: "#dc2626", cursor: deletingId === employer.employer_id ? "not-allowed" : "pointer", fontSize: "13px" }}>{deletingId === employer.employer_id ? "Deleting..." : "Delete"}</button></td>
        </tr>)}</tbody>
      </table>
      {error && <div style={{ padding: "14px 20px", color: "#b91c1c", background: "#fee2e2" }}>{error}</div>}
    </div>
  </div>;
}
