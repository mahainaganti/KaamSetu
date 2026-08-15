"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteWorker, getWorkers } from "@/lib/api";
import { initials, statusVariant } from "@/lib/badge";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";
import TableSkeleton from "@/components/TableSkeleton";

type Worker = { worker_id: number; full_name: string; preferred_language: string; average_rating: number; availability_status: string };

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const confirmAction = useConfirm();
  const showToast = useToast();

  useEffect(() => {
    async function loadWorkers() {
      try {
        setError("");
        setWorkers(await getWorkers());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch workers.");
      } finally {
        setLoading(false);
      }
    }
    loadWorkers();
  }, []);

  async function handleDelete(worker: Worker) {
    const confirmed = await confirmAction({
      title: "Delete worker?",
      message: `Delete ${worker.full_name}? This action cannot be undone.`,
      confirmLabel: "Delete Worker",
    });
    if (!confirmed) return;

    setDeletingId(worker.worker_id);
    setError("");
    try {
      await deleteWorker(String(worker.worker_id));
      setWorkers((current) => current.filter(({ worker_id }) => worker_id !== worker.worker_id));
      showToast(`${worker.full_name} was deleted.`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete worker.";
      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return workers;
    return workers.filter((worker) =>
      worker.full_name.toLowerCase().includes(query) || worker.preferred_language.toLowerCase().includes(query)
    );
  }, [workers, search]);

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Workers</h1>
          <p className="page-description">Find and manage registered workers.</p>
        </div>
        <Link href="/workers/new" className="primary-button">+ New Worker</Link>
      </div>
      <div className="table-container">
        <div className="toolbar">
          <div className="search-field">
            <span className="search-field-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or language..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search workers"
            />
          </div>
          <span className="result-count">{filtered.length} of {workers.length} workers</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Language</th><th>Rating</th><th>Availability</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <TableSkeleton columns={6} />
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <span className="empty-state-icon">👷</span>
                    <span className="empty-state-title">No workers found</span>
                    <span className="empty-state-description">
                      {workers.length === 0 ? "Register your first worker to get started." : "Try a different search term."}
                    </span>
                  </div>
                </td></tr>
              ) : filtered.map((worker) => (
                <tr key={worker.worker_id}>
                  <td>{worker.worker_id}</td>
                  <td>
                    <Link href={`/workers/${worker.worker_id}`} className="name-cell">
                      <span className="avatar-chip">{initials(worker.full_name)}</span>
                      <span className="link-primary">{worker.full_name}</span>
                    </Link>
                  </td>
                  <td>{worker.preferred_language}</td>
                  <td>⭐ {worker.average_rating}</td>
                  <td><span className={`badge ${statusVariant(worker.availability_status)}`}>{worker.availability_status}</span></td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/workers/${worker.worker_id}`} className="action-link view">View</Link>
                      <Link href={`/workers/edit/${worker.worker_id}`} className="action-link edit">Edit</Link>
                      <button type="button" className="btn-delete" onClick={() => handleDelete(worker)} disabled={deletingId === worker.worker_id}>{deletingId === worker.worker_id ? "Deleting..." : "Delete"}</button>
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
