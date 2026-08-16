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

  const [searchQuery, setSearchQuery] = useState("");
  const [employerType, setEmployerType] = useState("");
  const [locationId, setLocationId] = useState("");

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

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data: Employer[] = await getEmployers();
      let filtered = data;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (emp) =>
            emp.full_name.toLowerCase().includes(q) ||
            emp.phone.toLowerCase().includes(q) ||
            emp.email.toLowerCase().includes(q)
        );
      }
      if (employerType.trim()) {
        const t = employerType.trim().toLowerCase();
        filtered = filtered.filter((emp) => emp.employer_type.toLowerCase() === t);
      }
      if (locationId.trim()) {
        filtered = filtered.filter((emp) => String(emp.location_id) === locationId.trim());
      }
      setEmployers(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search employers.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setSearchQuery("");
    setEmployerType("");
    setLocationId("");
    await loadEmployers();
  }

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

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Employers</h1>
          <p className="page-description">Find and manage registered employers.</p>
        </div>
        <Link href="/employers/new" className="primary-button" style={{ textDecoration: "none", display: "inline-block" }}>+ New Employer</Link>
      </div>

      {/* Search / Filter Section */}
      <div className="table-container" style={{ marginBottom: "25px" }}>
        <div className="table-header">Search / Filter Employers</div>
        <form onSubmit={handleSearch} style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <label htmlFor="filter_query" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Search (Name, Phone, Email)
              </label>
              <input
                id="filter_query"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. ABC Industries or 98765"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label htmlFor="filter_type" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Employer Type
              </label>
              <select
                id="filter_type"
                value={employerType}
                onChange={(e) => setEmployerType(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              >
                <option value="">All Types</option>
                <option value="Individual">Individual</option>
                <option value="Household">Household</option>
                <option value="Business">Business</option>
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
                placeholder="e.g. 5"
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
        <div className="table-header">All Employers</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Type</th>
              <th>Verification</th>
              <th>Location ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}>Loading employers...</td></tr>
            ) : employers.length === 0 ? (
              <tr><td colSpan={8}>No employers found.</td></tr>
            ) : (
              employers.map((employer) => (
                <tr key={employer.employer_id}>
                  <td>{employer.employer_id}</td>
                  <td><Link href={`/employers/${employer.employer_id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>{employer.full_name}</Link></td>
                  <td>{employer.phone}</td>
                  <td>{employer.email}</td>
                  <td>{employer.employer_type}</td>
                  <td>{employer.verification_status}</td>
                  <td>{employer.location_id}</td>
                  <td>
                    <Link href={`/employers/${employer.employer_id}`} style={{ marginRight: "12px", color: "#2563eb", textDecoration: "none" }}>View</Link>
                    <Link href={`/employers/edit/${employer.employer_id}`} style={{ color: "#16a34a", textDecoration: "none" }}>Edit</Link>
                    <button type="button" onClick={() => handleDelete(employer)} disabled={deletingId === employer.employer_id} style={{ marginLeft: "12px", border: "none", background: "transparent", color: "#dc2626", cursor: deletingId === employer.employer_id ? "not-allowed" : "pointer", fontSize: "13px" }}>{deletingId === employer.employer_id ? "Deleting..." : "Delete"}</button>
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
