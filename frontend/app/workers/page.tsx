"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deleteWorker, getWorkers, searchWorkers } from "@/lib/api";

type Worker = { worker_id: number; full_name: string; preferred_language: string; average_rating: number; availability_status: string };

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [language, setLanguage] = useState("");
  const [locationId, setLocationId] = useState("");
  const [minRating, setMinRating] = useState("");

  async function loadWorkers() {
    setLoading(true);
    setError("");
    try {
      setWorkers(await getWorkers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch workers.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkers();
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await searchWorkers({
        language,
        location_id: locationId,
        average_rating: minRating,
      });
      setWorkers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search workers.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setLanguage("");
    setLocationId("");
    setMinRating("");
    await loadWorkers();
  }

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

      {/* Search / Filter Section */}
      <div className="table-container" style={{ marginBottom: "25px" }}>
        <div className="table-header">Search / Filter Workers</div>
        <form onSubmit={handleSearch} style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <label htmlFor="filter_language" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Language
              </label>
              <input
                id="filter_language"
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. Telugu"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              />
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
            <div>
              <label htmlFor="filter_min_rating" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Minimum Rating
              </label>
              <input
                id="filter_min_rating"
                type="number"
                step="any"
                min="0"
                max="5"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                placeholder="e.g. 4.5"
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
