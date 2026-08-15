"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteEmployer, getEmployers } from "@/lib/api";
import { initials, statusVariant } from "@/lib/badge";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";
import TableSkeleton from "@/components/TableSkeleton";

type Employer = { employer_id: number; full_name: string; phone: string; email: string; employer_type: string; verification_status: string; location_id: number };

export default function EmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const confirmAction = useConfirm();
  const showToast = useToast();

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
    const confirmed = await confirmAction({
      title: "Delete employer?",
      message: `Delete ${employer.full_name}? This action cannot be undone.`,
      confirmLabel: "Delete Employer",
    });
    if (!confirmed) return;

    setDeletingId(employer.employer_id);
    setError("");
    try {
      await deleteEmployer(String(employer.employer_id));
      await loadEmployers();
      showToast(`${employer.full_name} was deleted.`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete employer.";
      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employers;
    return employers.filter((employer) =>
      employer.full_name.toLowerCase().includes(query) || employer.email.toLowerCase().includes(query)
    );
  }, [employers, search]);

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Employers</h1>
          <p className="page-description">Find and manage registered employers.</p>
        </div>
        <Link href="/employers/new" className="primary-button">+ New Employer</Link>
      </div>
      <div className="table-container">
        <div className="toolbar">
          <div className="search-field">
            <span className="search-field-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search employers"
            />
          </div>
          <span className="result-count">{filtered.length} of {employers.length} employers</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Type</th><th>Verification</th><th>Location ID</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <TableSkeleton columns={8} />
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <span className="empty-state-icon">🏢</span>
                    <span className="empty-state-title">No employers found</span>
                    <span className="empty-state-description">
                      {employers.length === 0 ? "Register your first employer to get started." : "Try a different search term."}
                    </span>
                  </div>
                </td></tr>
              ) : filtered.map((employer) => (
                <tr key={employer.employer_id}>
                  <td>{employer.employer_id}</td>
                  <td>
                    <Link href={`/employers/${employer.employer_id}`} className="name-cell">
                      <span className="avatar-chip">{initials(employer.full_name)}</span>
                      <span className="link-primary">{employer.full_name}</span>
                    </Link>
                  </td>
                  <td>{employer.phone}</td>
                  <td>{employer.email}</td>
                  <td>{employer.employer_type}</td>
                  <td><span className={`badge ${statusVariant(employer.verification_status)}`}>{employer.verification_status}</span></td>
                  <td>{employer.location_id}</td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/employers/${employer.employer_id}`} className="action-link view">View</Link>
                      <Link href={`/employers/edit/${employer.employer_id}`} className="action-link edit">Edit</Link>
                      <button type="button" className="btn-delete" onClick={() => handleDelete(employer)} disabled={deletingId === employer.employer_id}>{deletingId === employer.employer_id ? "Deleting..." : "Delete"}</button>
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
