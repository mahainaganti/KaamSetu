"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Dispute, getDisputes } from "@/lib/api";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [bookingId, setBookingId] = useState("");

  async function loadDisputes() {
    try {
      const data = await getDisputes();
      setError("");
      setDisputes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch disputes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getDisputes()
      .then((data) => {
        setError("");
        setDisputes(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch disputes."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await getDisputes();
      let filtered = data;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (d) =>
            d.dispute_reason.toLowerCase().includes(q) ||
            (d.employer_name && d.employer_name.toLowerCase().includes(q)) ||
            (d.worker_name && d.worker_name.toLowerCase().includes(q)) ||
            String(d.employer_id) === q ||
            String(d.worker_id) === q
        );
      }
      if (status.trim()) {
        const s = status.trim().toLowerCase();
        filtered = filtered.filter((d) => d.dispute_status.toLowerCase() === s);
      }
      if (bookingId.trim()) {
        filtered = filtered.filter((d) => String(d.booking_id) === bookingId.trim());
      }
      setDisputes(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search disputes.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setSearchQuery("");
    setStatus("");
    setBookingId("");
    await loadDisputes();
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Disputes</h1>
          <p className="page-description">View and manage reported disputes.</p>
        </div>
      </div>

      {/* Search / Filter Section */}
      <div className="table-container" style={{ marginBottom: "25px" }}>
        <div className="table-header">Search / Filter Disputes</div>
        <form onSubmit={handleSearch} style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <label htmlFor="filter_search" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Search (Reason, Employer, Worker)
              </label>
              <input
                id="filter_search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Incomplete work or name"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label htmlFor="filter_status" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Dispute Status
              </label>
              <select
                id="filter_status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              >
                <option value="">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter_booking_id" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Booking ID
              </label>
              <input
                id="filter_booking_id"
                type="number"
                min="1"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g. 34"
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
        <div className="table-header">All Disputes</div>
        <table>
          <thead>
            <tr>
              <th>Dispute ID</th>
              <th>Booking ID</th>
              <th>Employer</th>
              <th>Worker</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Resolved At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}>Loading disputes...</td></tr>
            ) : disputes.length === 0 ? (
              <tr><td colSpan={8}>No disputes found.</td></tr>
            ) : (
              disputes.map((d) => (
                <tr key={d.dispute_id}>
                  <td>{d.dispute_id}</td>
                  <td>
                    <Link href={`/bookings/${d.booking_id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
                      Booking #{d.booking_id}
                    </Link>
                  </td>
                  <td>{d.employer_name ? d.employer_name : `Employer #${d.employer_id}`}</td>
                  <td>{d.worker_name ? d.worker_name : `Worker #${d.worker_id}`}</td>
                  <td>{d.dispute_reason}</td>
                  <td>{d.dispute_status}</td>
                  <td>{d.created_at ?? "Not set"}</td>
                  <td>{d.resolved_at ?? "Pending"}</td>
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
