"use client";

import { useState } from "react";
import { toggleDuty } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export default function DutyPage() {
  const showToast = useToast();
  const [workerId, setWorkerId] = useState("");
  const [dutyStatus, setDutyStatus] = useState<"online" | "offline">("offline");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function getLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err)
      );
    });
  }

  async function handleToggle() {
    setError("");
    if (!workerId) {
      setError("Enter your worker ID first.");
      return;
    }
    setLoading(true);
    try {
      const nextStatus = dutyStatus === "online" ? "offline" : "online";
      let lat: number | undefined;
      let lng: number | undefined;
      if (nextStatus === "online") {
        const loc = await getLocation();
        lat = loc.lat;
        lng = loc.lng;
      }
      await toggleDuty(Number(workerId), nextStatus, lat, lng);
      setDutyStatus(nextStatus);
      showToast(nextStatus === "online" ? "You're online and can receive job offers." : "You're offline.", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update duty status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Duty Status</h1>
        <p className="page-description">Go online to receive instant job offers near you.</p>
      </div>

      <div className="table-container">
        <div className="table-header">Worker</div>
        <div className="form-panel">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="worker_id" className="form-label">Worker ID</label>
              <input
                id="worker_id"
                type="number"
                min="1"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                placeholder="Example: 1"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-note">
            <strong>Current status</strong>
            <p>
              <span className={`badge ${dutyStatus === "online" ? "badge-success" : "badge-neutral"}`}>
                {dutyStatus === "online" ? "Online" : "Offline"}
              </span>
            </p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button type="button" className="primary-button" disabled={loading} onClick={handleToggle}>
            {loading ? "Updating..." : dutyStatus === "online" ? "Go Offline" : "Go Online"}
          </button>
        </div>
      </div>
    </div>
  );
}
