"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createServiceRequest } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export default function NewServiceRequestPage() {
  const router = useRouter();
  const showToast = useToast();

  const [customerId, setCustomerId] = useState("");
  const [rawText, setRawText] = useState("");
  const [categoryHint, setCategoryHint] = useState("plumbing");
  const [urgency, setUrgency] = useState("high");
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!customerId || !rawText.trim()) {
      setError("Enter your customer ID and describe what you need.");
      return;
    }
    setLoading(true);
    try {
      const { lat, lng } = await getLocation();
      const { request_id } = await createServiceRequest({
        customer_id: Number(customerId),
        raw_text: rawText.trim(),
        lat,
        lng,
        category_hint: categoryHint,
        urgency,
      });
      showToast("Finding a worker near you...", "info");
      router.push(`/help/${request_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Need Help Now</h1>
        <p className="page-description">Describe the work you need — we&apos;ll find a nearby worker instantly.</p>
      </div>

      <div className="table-container">
        <div className="table-header">Request Details</div>

        <form onSubmit={handleSubmit} className="form-panel">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="customer_id" className="form-label">Customer ID</label>
              <input
                id="customer_id"
                type="number"
                min="1"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Example: 1"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category_hint" className="form-label">Category</label>
              <select id="category_hint" value={categoryHint} onChange={(e) => setCategoryHint(e.target.value)} className="form-input">
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="carpentry">Carpentry</option>
                <option value="cleaning">Cleaning</option>
                <option value="ac_repair">AC Repair</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="urgency" className="form-label">Urgency</label>
              <select id="urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)} className="form-input">
                <option value="high">High — right now</option>
                <option value="normal">Normal — today</option>
                <option value="low">Low — this week</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="raw_text" className="form-label">What do you need done?</label>
            <textarea
              id="raw_text"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              required
              rows={4}
              placeholder="Example: Bathroom tap is leaking badly, need a plumber right now."
              className="form-input"
            />
          </div>

          <div className="form-note">
            <strong>How this works</strong>
            <p>We&apos;ll use your current location and match nearby online workers by what you described.</p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Finding a worker..." : "Find a Worker Now"}
          </button>
        </form>
      </div>
    </div>
  );
}
