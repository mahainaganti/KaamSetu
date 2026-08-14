"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBookings, getPayment, updatePayment } from "@/lib/api";
import { BookingOption, PaymentForm, PaymentFormData } from "../../new/page";

export default function EditPaymentPage() {
  const params = useParams<{ id: string }>(); const router = useRouter(); const [formData, setFormData] = useState<PaymentFormData | null>(null); const [bookings, setBookings] = useState<BookingOption[]>([]); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  useEffect(() => { Promise.all([getPayment(params.id), getBookings()]).then(([payment, bookingsData]) => { setError(""); setBookings(bookingsData); setFormData({ booking_id: String(payment.booking_id), amount: String(payment.amount), payment_method: payment.payment_method, payment_status: payment.payment_status, transaction_id: payment.transaction_id }); }).catch((err) => setError(err instanceof Error ? err.message : "Failed to load payment information.")).finally(() => setLoading(false)); }, [params.id]);
  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) { const { name, value } = event.target; setFormData((current) => current ? { ...current, [name]: value } : current); }
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (!formData) return; setSaving(true); setError(""); try { await updatePayment(params.id, { booking_id: Number(formData.booking_id), amount: Number(formData.amount), payment_method: formData.payment_method, payment_status: formData.payment_status, transaction_id: formData.transaction_id }); router.push(`/payments/${params.id}`); } catch (err) { setError(err instanceof Error ? err.message : "Failed to update payment."); } finally { setSaving(false); } }
  if (loading) return <div className="page-container">Loading payment and bookings...</div>;
  if (!formData) return <div className="page-container"><h1 className="page-title">Edit Payment</h1><div style={{ marginTop: "20px", padding: "12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "7px" }}>{error || "Payment not found."}</div></div>;
  return <PaymentForm title="Edit Payment" description="Update this payment." formData={formData} bookings={bookings} error={error} loading={saving} submitLabel="Save Changes" onChange={handleChange} onSubmit={handleSubmit} />;
}
