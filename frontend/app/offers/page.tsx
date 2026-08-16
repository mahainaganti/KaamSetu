"use client";

import { useCallback, useEffect, useState } from "react";
import { acceptOffer, declineOffer, getWorkerOffers, WorkerOffer } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

function secondsLeft(expiresAt: string) {
  return Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

export default function OffersPage() {
  const showToast = useToast();
  const [workerId, setWorkerId] = useState("");
  const [activeWorkerId, setActiveWorkerId] = useState<number | null>(null);
  const [offers, setOffers] = useState<WorkerOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, forceTick] = useState(0);

  const refresh = useCallback(async (id: number) => {
    try {
      const data = await getWorkerOffers(id);
      setOffers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load offers.");
    }
  }, []);

  useEffect(() => {
    if (activeWorkerId === null) return;
    refresh(activeWorkerId);
    const dataInterval = setInterval(() => refresh(activeWorkerId), 3000);
    const tickInterval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => {
      clearInterval(dataInterval);
      clearInterval(tickInterval);
    };
  }, [activeWorkerId, refresh]);

  function handleLoad() {
    setError("");
    if (!workerId) {
      setError("Enter your worker ID first.");
      return;
    }
    setActiveWorkerId(Number(workerId));
  }

  async function handleAccept(offer: WorkerOffer) {
    if (activeWorkerId === null) return;
    setLoading(true);
    try {
      const result = await acceptOffer(offer.offer_id, activeWorkerId);
      if (result.won) {
        showToast("You got the job! Booking created.", "success");
      } else {
        showToast("Too slow — another worker already took this one.", "error");
      }
      await refresh(activeWorkerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept offer.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecline(offer: WorkerOffer) {
    if (activeWorkerId === null) return;
    setLoading(true);
    try {
      await declineOffer(offer.offer_id, activeWorkerId);
      showToast("Offer declined.", "info");
      await refresh(activeWorkerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to decline offer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Job Offers</h1>
        <p className="page-description">Live offers waiting for you to accept. Be quick — first accept wins.</p>
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
          {error && <div className="error-banner">{error}</div>}
          <button type="button" className="primary-button" onClick={handleLoad}>
            View My Offers
          </button>
        </div>
      </div>

      {activeWorkerId !== null && (
        <div className="table-container" style={{ marginTop: "1.5rem" }}>
          <div className="table-header">Pending Offers</div>
          {offers.length === 0 ? (
            <div className="form-panel">
              <p>No pending offers right now. Make sure you&apos;re online on the Duty page.</p>
            </div>
          ) : (
            <div className="form-panel">
              {offers.map((offer) => (
                <div key={offer.offer_id} className="form-note" style={{ marginBottom: "1rem" }}>
                  <strong>{offer.category_hint ?? "Job"}</strong>
                  <p>{offer.raw_text}</p>
                  <p>
                    <span className="badge badge-warning">
                      {secondsLeft(offer.expires_at)}s left
                    </span>{" "}
                    <span className="badge badge-neutral">wave {offer.wave_no}</span>
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button type="button" className="primary-button" disabled={loading} onClick={() => handleAccept(offer)}>
                      Accept
                    </button>
                    <button type="button" className="btn-secondary" disabled={loading} onClick={() => handleDecline(offer)}>
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
