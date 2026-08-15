"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  deleteRating,
  getEmployers,
  getRatings,
  getWorkers,
} from "@/lib/api";
import { stars } from "@/lib/badge";
import { useConfirm } from "@/components/ConfirmProvider";
import { useToast } from "@/components/ToastProvider";
import TableSkeleton from "@/components/TableSkeleton";

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
  const [search, setSearch] = useState("");
  const confirmAction = useConfirm();
  const showToast = useToast();

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
      setError(err instanceof Error ? err.message : "Failed to fetch ratings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([getRatings(), getEmployers(), getWorkers()])
      .then(([ratingsData, employersData, workersData]) => {
        if (cancelled) return;

        setError("");
        setRatings(ratingsData);
        setEmployers(employersData);
        setWorkers(workersData);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to fetch ratings.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const employerNames = new Map(employers.map((employer) => [employer.employer_id, employer.full_name]));
  const workerNames = new Map(workers.map((worker) => [worker.worker_id, worker.full_name]));

  async function handleDelete(rating: Rating) {
    const confirmed = await confirmAction({
      title: "Delete rating?",
      message: "Are you sure you want to delete this rating?",
      confirmLabel: "Delete Rating",
    });
    if (!confirmed) return;

    setDeletingId(rating.rating_id);
    setError("");
    try {
      await deleteRating(String(rating.rating_id));
      await loadRatings();
      showToast(`Rating #${rating.rating_id} was deleted.`, "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete rating.";
      setError(message);
      showToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ratings;
    return ratings.filter((rating) => {
      const employerName = employerNames.get(rating.employer_id) ?? "";
      const workerName = workerNames.get(rating.worker_id) ?? "";
      return employerName.toLowerCase().includes(query) || workerName.toLowerCase().includes(query) || (rating.review ?? "").toLowerCase().includes(query);
    });
  }, [ratings, search, employerNames, workerNames]);

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Ratings</h1>
          <p className="page-description">Manage feedback for completed bookings.</p>
        </div>
        <Link href="/ratings/new" className="primary-button">+ New Rating</Link>
      </div>

      <div className="table-container">
        <div className="toolbar">
          <div className="search-field">
            <span className="search-field-icon">🔍</span>
            <input type="text" placeholder="Search by employer, worker, or review..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search ratings" />
          </div>
          <span className="result-count">{filtered.length} of {ratings.length} ratings</span>
        </div>

        <div className="table-scroll">
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
                <TableSkeleton columns={8} />
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <span className="empty-state-icon">⭐</span>
                    <span className="empty-state-title">No ratings found</span>
                    <span className="empty-state-description">
                      {ratings.length === 0 ? "Record your first rating to get started." : "Try a different search term."}
                    </span>
                  </div>
                </td></tr>
              ) : (
                filtered.map((rating) => (
                  <tr key={rating.rating_id}>
                    <td>{rating.rating_id}</td>
                    <td>Booking #{rating.booking_id}</td>
                    <td>{employerNames.get(rating.employer_id) || `Employer #${rating.employer_id}`}</td>
                    <td>{workerNames.get(rating.worker_id) || `Worker #${rating.worker_id}`}</td>
                    <td><span className="star-rating">{stars(rating.rating)}</span></td>
                    <td><span className="review-text">{rating.review || "Not set"}</span></td>
                    <td>{rating.rated_at || "Not set"}</td>
                    <td>
                      <div className="row-actions">
                        <Link href={`/ratings/${rating.rating_id}`} className="action-link view">View</Link>
                        <Link href={`/ratings/edit/${rating.rating_id}`} className="action-link edit">Edit</Link>
                        <button type="button" className="btn-delete" onClick={() => handleDelete(rating)} disabled={deletingId === rating.rating_id}>
                          {deletingId === rating.rating_id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {error && <div className="table-error">{error}</div>}
      </div>
    </div>
  );
}
