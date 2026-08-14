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