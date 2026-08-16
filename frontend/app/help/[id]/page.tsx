"use client";

import { use, useEffect, useState } from "react";
import { createCallSession, getServiceRequest, ServiceRequest } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

const STATUS_LABEL: Record<string, string> = {
  SEARCHING: "Searching for a worker...",
  OFFERED: "Waiting for a worker to accept...",
  ASSIGNED: "Worker assigned!",
  IN_PROGRESS: "Job in progress",
  COMPLETED: "Job completed",
  CANCELLED: "Request cancelled",
  EXPIRED: "No worker was found",
};

export default function ServiceRequestStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const showToast = useToast();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [error, setError] = useState("");
  const [callInfo, setCallInfo] = useState<{ virtual_number: string } | null>(null);
  const [callLoading, setCallLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const data = await getServiceRequest(Number(id));
        if (!cancelled) setRequest(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load request status.");
      }
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  async function handleCall() {
    if (!request?.booking_id) return;
    setCallLoading(true);
    try {
      const session = await createCallSession(request.booking_id);
      setCallInfo(session);
      showToast("Call connected via masked number.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to start call.", "error");
    } finally {
      setCallLoading(false);
    }
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="page-container">
        <p>Loading...</p>
      </div>
    );
  }

  const pendingOffers = request.offers.filter((o) => o.status === "PENDING");

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Request #{request.request_id}</h1>
        <p className="page-description">{request.raw_text}</p>
      </div>

      <div className="table-container">
        <div className="table-header">Status</div>
        <div className="form-panel">
          <p>
            <span className={`badge ${request.status === "ASSIGNED" ? "badge-success" : "badge-warning"}`}>
              {STATUS_LABEL[request.status] ?? request.status}
            </span>{" "}
            <span className="badge badge-neutral">wave {request.wave_no}</span>
          </p>

          {(request.status === "SEARCHING" || request.status === "OFFERED") && (
            <p>{pendingOffers.length} worker(s) currently being asked...</p>
          )}

          {request.status === "ASSIGNED" && (
            <div className="form-note">
              <strong>Worker #{request.assigned_worker} accepted your request.</strong>
              <p>Booking #{request.booking_id} was created. Use the call button below to reach them via a masked number.</p>
              <button type="button" className="primary-button" disabled={callLoading || !request.booking_id} onClick={handleCall}>
                {callLoading ? "Connecting..." : "Call Worker"}
              </button>
              {callInfo && (
                <p style={{ marginTop: "0.5rem" }}>
                  Call this number: <strong>{callInfo.virtual_number}</strong>
                </p>
              )}
            </div>
          )}

          {request.status === "EXPIRED" && (
            <div className="form-note">
              <strong>No worker accepted in time.</strong>
              <p>Try posting this as a regular job instead, or submit another instant request.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
