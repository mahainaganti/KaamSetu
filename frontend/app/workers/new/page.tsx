"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorker } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export default function NewWorkerPage() {
  const router = useRouter();
  const showToast = useToast();

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    gender: "Female",
    preferred_language: "English",
    experience_years: "",
    location_id: "",
    travel_radius_km: "",
    availability_status: "Available",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await createWorker({
        full_name: formData.full_name,
        phone: formData.phone,
        gender: formData.gender,
        preferred_language: formData.preferred_language,
        experience_years: Number(formData.experience_years),
        travel_radius_km: Number(formData.travel_radius_km),
        average_rating: 0,
        verification_status: "Pending",
        availability_status: formData.availability_status,
        location_id: Number(formData.location_id),
      });
      showToast(`${formData.full_name} was added.`, "success");
      router.push("/workers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create worker. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Add New Worker</h1>
        <p className="page-description">Register a new worker on the KaamSetu platform.</p>
      </div>

      <div className="table-container">
        <div className="table-header">Worker Information</div>

        <form onSubmit={handleSubmit} className="form-panel">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="full_name" className="form-label">Full Name</label>
              <input id="full_name" name="full_name" type="text" value={formData.full_name} onChange={handleChange} required placeholder="Enter worker name" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone</label>
              <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="Enter phone number" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="gender" className="form-label">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="form-input">
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preferred_language" className="form-label">Preferred Language</label>
              <input id="preferred_language" name="preferred_language" type="text" value={formData.preferred_language} onChange={handleChange} required placeholder="Example: English" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="experience_years" className="form-label">Experience (Years)</label>
              <input id="experience_years" name="experience_years" type="number" min="0" value={formData.experience_years} onChange={handleChange} required placeholder="Example: 5" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="location_id" className="form-label">Location ID</label>
              <input id="location_id" name="location_id" type="number" min="1" value={formData.location_id} onChange={handleChange} required placeholder="Example: 475" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="travel_radius_km" className="form-label">Travel Radius (km)</label>
              <input id="travel_radius_km" name="travel_radius_km" type="number" min="0" value={formData.travel_radius_km} onChange={handleChange} required placeholder="Example: 30" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="availability_status" className="form-label">Availability Status</label>
              <select id="availability_status" name="availability_status" value={formData.availability_status} onChange={handleChange} className="form-input">
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
          </div>

          <div className="form-note">
            <strong>Automatic Information</strong>
            <p>New workers start with a rating of 0 and verification status of Pending.</p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Creating Worker..." : "Create Worker"}
          </button>
        </form>
      </div>
    </div>
  );
}
