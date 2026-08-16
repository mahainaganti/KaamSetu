"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  deleteRating,
  getEmployers,
  getRatings,
  getWorkers,
} from "@/lib/api";

type Rating = {
  rating_id: number;
  booking_id: number;
  employer_id: number;
  worker_id: number;
  rating: number;
  review: string | null;
  rated_at: string | null;
};

type Employer = {
  employer_id: number;
  full_name: string;
};

type Worker = {
  worker_id: number;
  full_name: string;
};

export default function RatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState("");
  const [bookingId, setBookingId] = useState("");

  async function loadRatings() {
    try {
      const [ratingsData, employersData, workersData] = await Promise.all([
        getRatings(),
        getEmployers(),
        getWorkers(),
      ]);

      setError("");
      setRatings(ratingsData);
      setEmployers(employersData);
      setWorkers(workersData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch ratings."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      getRatings(),
      getEmployers(),
      getWorkers(),
    ])
      .then(([ratingsData, employersData, workersData]) => {
        if (cancelled) return;

        setError("");
        setRatings(ratingsData);
        setEmployers(employersData);
        setWorkers(workersData);
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch ratings."
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const employerNames = new Map(
    employers.map((employer) => [
      employer.employer_id,
      employer.full_name,
    ])
  );

  const workerNames = new Map(
    workers.map((worker) => [
      worker.worker_id,
      worker.full_name,
    ])
  );

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const ratingsData: Rating[] = await getRatings();
      let filtered = ratingsData;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter((r) => {
          const empName = employerNames.get(r.employer_id)?.toLowerCase() || "";
          const wrkName = workerNames.get(r.worker_id)?.toLowerCase() || "";
          const rev = (r.review || "").toLowerCase();
          return (
            empName.includes(q) ||
            wrkName.includes(q) ||
            rev.includes(q) ||
            String(r.worker_id) === q ||
            String(r.employer_id) === q
          );
        });
      }

      if (minRating.trim()) {
        const min = Number(minRating.trim());
        if (!isNaN(min)) {
          filtered = filtered.filter((r) => r.rating >= min);
        }
      }

      if (bookingId.trim()) {
        filtered = filtered.filter((r) => String(r.booking_id) === bookingId.trim());
      }

      setRatings(filtered);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to search ratings."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setSearchQuery("");
    setMinRating("");
    setBookingId("");
    await loadRatings();
  }

  async function handleDelete(rating: Rating) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rating?"
    );

    if (!confirmed) return;

    setDeletingId(rating.rating_id);
    setError("");

    try {
      await deleteRating(String(rating.rating_id));
      await loadRatings();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete rating."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-container">
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 className="page-title">Ratings</h1>

          <p className="page-description">
            Manage feedback for completed bookings.
          </p>
        </div>

        <Link
          href="/ratings/new"
          className="primary-button"
          style={{
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          + New Rating
        </Link>
      </div>

      {/* Search / Filter Section */}
      <div className="table-container" style={{ marginBottom: "25px" }}>
        <div className="table-header">Search / Filter Ratings</div>
        <form onSubmit={handleSearch} style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <label htmlFor="filter_query" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Search (Worker, Employer, Review)
              </label>
              <input
                id="filter_query"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Worker name or review text"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label htmlFor="filter_min_rating" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Minimum Rating
              </label>
              <select
                id="filter_min_rating"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
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
                placeholder="e.g. 2001"
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
        <div className="table-header">
          All Ratings
        </div>

        <table>
          <thead>
            <tr>
              <th>Rating ID</th>
              <th>Booking</th>
              <th>Employer</th>
              <th>Worker</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Rated At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>
                  Loading ratings...
                </td>
              </tr>
            ) : ratings.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  No ratings found.
                </td>
              </tr>
            ) : (
              ratings.map((rating) => (
                <tr key={rating.rating_id}>
                  <td>
                    {rating.rating_id}
                  </td>

                  <td>
                    Booking #{rating.booking_id}
                  </td>

                  <td>
                    {employerNames.get(rating.employer_id) ||
                      `Employer #${rating.employer_id}`}
                  </td>

                  <td>
                    {workerNames.get(rating.worker_id) ||
                      `Worker #${rating.worker_id}`}
                  </td>

                  <td>
                    {rating.rating}/5
                  </td>

                  <td>
                    {rating.review || "Not set"}
                  </td>

                  <td>
                    {rating.rated_at || "Not set"}
                  </td>

                  <td>
                    <Link
                      href={`/ratings/${rating.rating_id}`}
                      style={{
                        marginRight: "12px",
                        color: "#2563eb",
                        textDecoration: "none",
                      }}
                    >
                      View
                    </Link>

                    <Link
                      href={`/ratings/edit/${rating.rating_id}`}
                      style={{
                        color: "#16a34a",
                        textDecoration: "none",
                      }}
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(rating)}
                      disabled={
                        deletingId === rating.rating_id
                      }
                      style={{
                        marginLeft: "12px",
                        border: "none",
                        background: "transparent",
                        color: "#dc2626",
                        cursor:
                          deletingId === rating.rating_id
                            ? "not-allowed"
                            : "pointer",
                        fontSize: "13px",
                      }}
                    >
                      {deletingId === rating.rating_id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {error && (
          <div
            style={{
              padding: "14px 20px",
              color: "#b91c1c",
              background: "#fee2e2",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}