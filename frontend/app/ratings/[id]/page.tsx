"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getBookings, getEmployers, getRating, getWorkers } from "@/lib/api";
import { stars } from "@/lib/badge";

type Rating = { rating_id: number; booking_id: number; employer_id: number; worker_id: number; rating: number; review: string | null; rated_at: string | null };

export default function RatingDetailsPage() {
  const params = useParams<{ id: string }>();
  const [rating, setRating] = useState<Rating | null>(null);
  const [bookingText, setBookingText] = useState("");
  const [employerText, setEmployerText] = useState("");
  const [workerText, setWorkerText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getRating(params.id), getBookings(), getEmployers(), getWorkers()])
      .then(([ratingData, bookings, employers, workers]) => {
        setRating(ratingData);
        const booking = bookings.find((item: { booking_id: number }) => item.booking_id === ratingData.booking_id);
        const employer = employers.find((item: { employer_id: number }) => item.employer_id === ratingData.employer_id);
        const worker = workers.find((item: { worker_id: number }) => item.worker_id === ratingData.worker_id);
        setBookingText(booking ? `Booking #${booking.booking_id} - Job #${booking.job_id} - Scheduled: ${booking.scheduled_date}` : `Booking #${ratingData.booking_id}`);
        setEmployerText(employer ? `${employer.full_name} - ID ${employer.employer_id}` : `Employer #${ratingData.employer_id}`);
        setWorkerText(worker ? `${worker.full_name} - ID ${worker.worker_id}` : `Worker #${ratingData.worker_id}`);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch rating."))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="page-container">Loading rating...</div>;
  if (error) return <div className="page-container"><h1 className="page-title">Rating Details</h1><div className="error-banner">{error}</div></div>;
  if (!rating) return <div className="page-container">Rating not found.</div>;

  const fields: [string, string][] = [
    ["Booking", bookingText],
    ["Employer", employerText],
    ["Worker", workerText],
    ["Rated At", rating.rated_at ?? "Not set"],
  ];

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Rating Details</h1>
          <p className="page-description">Complete feedback information for this booking.</p>
        </div>
        <div className="detail-hero-actions">
          <Link href="/ratings" className="btn-secondary">Back to Ratings</Link>
          <Link href={`/ratings/edit/${rating.rating_id}`} className="primary-button">Edit Rating</Link>
        </div>
      </div>

      <div className="table-container">
        <div className="detail-hero">
          <span className="avatar-chip avatar-chip-lg">⭐</span>
          <div className="detail-hero-body">
            <div className="detail-hero-title">Rating #{rating.rating_id}</div>
            <div className="detail-hero-subtitle"><span className="star-rating">{stars(rating.rating)}</span> &nbsp;{rating.rating}/5</div>
          </div>
        </div>

        {rating.review && (
          <div className="detail-description-block">
            <div className="section-title">Review</div>
            <p className="detail-description">{rating.review}</p>
          </div>
        )}

        <div className="info-grid">
          {fields.map(([label, value]) => (
            <div className="info-tile" key={label}>
              <div className="info-tile-label">{label}</div>
              <div className="info-tile-value">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
