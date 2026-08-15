"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPayment } from "@/lib/api";
import { statusVariant } from "@/lib/badge";

type Payment = { payment_id: number; booking_id: number; amount: number; payment_method: string; payment_status: string; transaction_id: string; payment_date: string | null };

export default function PaymentDetailsPage() {
  const params = useParams<{ id: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { getPayment(params.id).then((data) => { setError(""); setPayment(data); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch payment.")).finally(() => setLoading(false)); }, [params.id]);
  if (loading) return <div className="page-container">Loading payment...</div>;
  if (error) return <div className="page-container"><h1 className="page-title">Payment Details</h1><div className="error-banner">{error}</div></div>;
  if (!payment) return <div className="page-container">Payment not found.</div>;

  const fields: [string, string | number | null][] = [
    ["Booking ID", payment.booking_id],
    ["Amount", `₹${payment.amount}`],
    ["Payment Method", payment.payment_method],
    ["Transaction ID", payment.transaction_id],
    ["Payment Date", payment.payment_date],
  ];

  return (
    <div className="page-container">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Payment Details</h1>
          <p className="page-description">Complete information about this payment.</p>
        </div>
        <div className="detail-hero-actions">
          <Link href="/payments" className="btn-secondary">Back to Payments</Link>
          <Link href={`/payments/edit/${payment.payment_id}`} className="primary-button">Edit Payment</Link>
        </div>
      </div>

      <div className="table-container">
        <div className="detail-hero">
          <span className="avatar-chip avatar-chip-lg">💳</span>
          <div className="detail-hero-body">
            <div className="detail-hero-title">Payment #{payment.payment_id}</div>
            <div className="detail-hero-subtitle">Booking #{payment.booking_id}</div>
            <div className="detail-hero-badges">
              <span className={`badge ${statusVariant(payment.payment_status)}`}>{payment.payment_status}</span>
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
