"use client";

import { useState } from "react";
import { getDispatchAdmin } from "@/lib/api";
import { statusVariant } from "@/lib/badge";

type DispatchRow = {
  request_id: number;
  status: string;
  wave_no: number;
  category_hint: string | null;
  created_at: string;
  assigned_worker: number | null;
  job_id: number | null;
  pending_offers: number;
};

export default function DispatchAdminPage() {
  const [passcode, setPasscode] = useState("");
  const [rows, setRows] = useState<DispatchRow[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLoad() {
    setError("");
    setLoading(true);
    try {
      const data = await getDispatchAdmin(passcode);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dispatch board.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dispatch Board</h1>
        <p className="page-description">Live view of all instant service requests.</p>
      </div>

      <div className="table-container">
        <div className="table-header">Admin Access</div>
        <div className="form-panel">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="passcode" className="form-label">Admin Passcode</label>
              <input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
          {error && <div className="error-banner">{error}</div>}
          <button type="button" className="primary-button" disabled={loading} onClick={handleLoad}>
            {loading ? "Loading..." : "Load Board"}
          </button>
        </div>
      </div>

      {rows && (
        <div className="table-container" style={{ marginTop: "1.5rem" }}>
          <div className="table-header">Requests ({rows.length})</div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Wave</th>
                  <th>Category</th>
                  <th>Pending Offers</th>
                  <th>Assigned Worker</th>
                  <th>Job</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.request_id}>
                    <td>{row.request_id}</td>
                    <td><span className={`badge ${statusVariant(row.status)}`}>{row.status}</span></td>
                    <td>{row.wave_no}</td>
                    <td>{row.category_hint ?? "—"}</td>
                    <td>{row.pending_offers}</td>
                    <td>{row.assigned_worker ?? "—"}</td>
                    <td>{row.job_id ?? "—"}</td>
                    <td>{row.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
