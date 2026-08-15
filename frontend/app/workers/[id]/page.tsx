import Link from "next/link";
import { getWorker } from "@/lib/api";
import { initials, statusVariant } from "@/lib/badge";

export default async function WorkerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const worker = await getWorker(id);

  const fields: [string, string][] = [
    ["Phone", worker.phone],
    ["Gender", worker.gender],
    ["Preferred Language", worker.preferred_language],
    ["Experience", `${worker.experience_years} years`],
    ["Location ID", String(worker.location_id)],
    ["Travel Radius", `${worker.travel_radius_km} km`],
    ["Average Rating", `⭐ ${worker.average_rating}`],
    ["Created At", worker.created_at],
    ["Updated At", worker.updated_at],
  ];

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Worker Details</h1>
          <p className="page-description">Complete information about this worker.</p>
        </div>
        <div className="detail-hero-actions">
          <Link href="/workers" className="btn-secondary">Back to Workers</Link>
          <Link href={`/workers/edit/${worker.worker_id}`} className="primary-button">Edit Worker</Link>
        </div>
      </div>

      <div className="table-container">
        <div className="detail-hero">
          <span className="avatar-chip avatar-chip-lg">{initials(worker.full_name)}</span>
          <div className="detail-hero-body">
            <div className="detail-hero-title">{worker.full_name}</div>
            <div className="detail-hero-subtitle">Worker #{worker.worker_id}</div>
            <div className="detail-hero-badges">
              <span className={`badge ${statusVariant(worker.availability_status)}`}>{worker.availability_status}</span>
              <span className={`badge ${statusVariant(worker.verification_status)}`}>{worker.verification_status}</span>
            </div>
          </div>
        </div>

        <div className="info-grid">
          {fields.map(([label, value]) => (
            <div className="info-tile" key={label}>
              <div className="info-tile-label">{label}</div>
              <div className="info-tile-value">{value ?? "Not set"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
