"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorker } from "@/lib/api";


export default function NewWorkerPage() {

  const router = useRouter();


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


  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();

    setError("");

    setLoading(true);


    try {

      await createWorker({

        full_name: formData.full_name,

        phone: formData.phone,

        gender: formData.gender,

        preferred_language:
          formData.preferred_language,

        experience_years:
          Number(formData.experience_years),

        travel_radius_km:
          Number(formData.travel_radius_km),

        average_rating: 0,

        verification_status: "Pending",

        availability_status:
          formData.availability_status,

        location_id:
          Number(formData.location_id),

      });


      router.push("/workers");


    } catch (err) {

      if (err instanceof Error) {

        setError(err.message);

      } else {

        setError(
          "Failed to create worker. Please try again."
        );

      }

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="page-container">

      {/* Page Header */}

      <div className="page-header">

        <h1 className="page-title">
          Add New Worker
        </h1>

        <p className="page-description">
          Register a new worker on the KaamSetu platform.
        </p>

      </div>


      {/* Form */}

      <div className="table-container">

        <div className="table-header">
          Worker Information
        </div>


        <form
          onSubmit={handleSubmit}
          style={{ padding: "25px" }}
        >


          {/* Full Name */}

          <div style={{ marginBottom: "20px" }}>

            <label
              htmlFor="full_name"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 600,
              }}
            >
              Full Name
            </label>


            <input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Enter worker name"
              style={{
                width: "100%",
                padding: "11px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
              }}
            />

          </div>


          {/* Phone */}

          <div style={{ marginBottom: "20px" }}>

            <label
              htmlFor="phone"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 600,
              }}
            >
              Phone
            </label>


            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter phone number"
              style={{
                width: "100%",
                padding: "11px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
              }}
            />

          </div>


          {/* Gender */}

          <div style={{ marginBottom: "20px" }}>

            <label
              htmlFor="gender"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 600,
              }}
            >
              Gender
            </label>


            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "11px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
              }}
            >

              <option value="Female">
                Female
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>


          {/* Preferred Language */}

          <div style={{ marginBottom: "20px" }}>

            <label
              htmlFor="preferred_language"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 600,
              }}
            >
              Preferred Language
            </label>


            <input
              id="preferred_language"
              name="preferred_language"
              type="text"
              value={formData.preferred_language}
              onChange={handleChange}
              required
              placeholder="Example: English"
              style={{
                width: "100%",
                padding: "11px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
              }}
            />

          </div>


          {/* Experience */}

          <div style={{ marginBottom: "20px" }}>

            <label
              htmlFor="experience_years"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 600,
              }}
            >
              Experience (Years)
            </label>


            <input
              id="experience_years"
              name="experience_years"
              type="number"
              min="0"
              value={formData.experience_years}
              onChange={handleChange}
              required
              placeholder="Example: 5"
              style={{
                width: "100%",
                padding: "11px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
              }}
            />

          </div>


          {/* Location ID */}

          <div style={{ marginBottom: "20px" }}>

            <label
              htmlFor="location_id"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 600,
              }}
            >
              Location ID
            </label>


            <input
              id="location_id"
              name="location_id"
              type="number"
              min="1"
              value={formData.location_id}
              onChange={handleChange}
              required
              placeholder="Example: 475"
              style={{
                width: "100%",
                padding: "11px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
              }}
            />

          </div>


          {/* Travel Radius */}

          <div style={{ marginBottom: "20px" }}>

            <label
              htmlFor="travel_radius_km"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 600,
              }}
            >
              Travel Radius (km)
            </label>


            <input
              id="travel_radius_km"
              name="travel_radius_km"
              type="number"
              min="0"
              value={formData.travel_radius_km}
              onChange={handleChange}
              required
              placeholder="Example: 30"
              style={{
                width: "100%",
                padding: "11px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
              }}
            />

          </div>


          {/* Availability */}

          <div style={{ marginBottom: "25px" }}>

            <label
              htmlFor="availability_status"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 600,
              }}
            >
              Availability Status
            </label>


            <select
              id="availability_status"
              name="availability_status"
              value={formData.availability_status}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "11px",
                border: "1px solid #d1d5db",
                borderRadius: "7px",
              }}
            >

              <option value="Available">
                Available
              </option>

              <option value="Busy">
                Busy
              </option>

              <option value="Unavailable">
                Unavailable
              </option>

            </select>

          </div>


          {/* Automatic Fields Information */}

          <div
            style={{
              marginBottom: "20px",
              padding: "15px",
              background: "#f3f4f6",
              borderRadius: "7px",
            }}
          >

            <strong>Automatic Information</strong>

            <p style={{ marginTop: "8px" }}>
              New workers start with a rating of 0 and
              verification status of Pending.
            </p>

          </div>


          {/* Error */}

          {error && (

            <div
              style={{
                marginBottom: "20px",
                padding: "12px",
                background: "#fee2e2",
                color: "#b91c1c",
                borderRadius: "7px",
              }}
            >
              {error}
            </div>

          )}


          {/* Submit */}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >

            {loading
              ? "Creating Worker..."
              : "Create Worker"
            }

          </button>


        </form>

      </div>

    </div>
  );
}