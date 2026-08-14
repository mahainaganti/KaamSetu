"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteWorker, getWorkers } from "@/lib/api";

type Worker = { worker_id: number; full_name: string; preferred_language: string; average_rating: number; availability_status: string };

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

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
    if (!window.confirm(`Delete ${worker.full_name}? This action cannot be undone.`)) return;
    setDeletingId(worker.worker_id);
    setError("");
    try {
      await deleteWorker(String(worker.worker_id));
      setWorkers((current) => current.filter(({ worker_id }) => worker_id !== worker.worker_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete worker.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Workers</h1>
          <p className="page-description">Find and manage registered workers.</p>
        </div>
        <Link href="/workers/new" className="primary-button" style={{ textDecoration: "none", display: "inline-block" }}>+ New Worker</Link>
      </div>
      <div className="table-container">
        <div className="table-header">All Workers</div>
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Language</th><th>Rating</th><th>Availability</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6}>Loading workers...</td></tr> : workers.length === 0 ? <tr><td colSpan={6}>No workers found.</td></tr> : workers.map((worker) => (
              <tr key={worker.worker_id}>
                <td>{worker.worker_id}</td>
                <td><Link href={`/workers/${worker.worker_id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>{worker.full_name}</Link></td>
                <td>{worker.preferred_language}</td>
                <td>{worker.average_rating}</td>
                <td>{worker.availability_status}</td>
                <td>
                  <Link href={`/workers/${worker.worker_id}`} style={{ marginRight: "12px", color: "#2563eb", textDecoration: "none" }}>View</Link>
                  <Link href={`/workers/edit/${worker.worker_id}`} style={{ color: "#16a34a", textDecoration: "none" }}>Edit</Link>
                  <button type="button" onClick={() => handleDelete(worker)} disabled={deletingId === worker.worker_id} style={{ marginLeft: "12px", border: "none", background: "transparent", color: "#dc2626", cursor: deletingId === worker.worker_id ? "not-allowed" : "pointer", fontSize: "13px" }}>{deletingId === worker.worker_id ? "Deleting..." : "Delete"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <div style={{ padding: "14px 20px", color: "#b91c1c", background: "#fee2e2" }}>{error}</div>}
      </div>
    </div>
  );
}
