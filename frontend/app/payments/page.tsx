"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { deletePayment, getPayments } from "@/lib/api";

type Payment = { payment_id: number; booking_id: number; amount: number; payment_method: string; payment_status: string; transaction_id: string; payment_date: string | null };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  async function loadPayments() {
    try {
      const data = await getPayments();
      setError("");
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getPayments()
      .then((data) => {
        setError("");
        setPayments(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch payments."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data: Payment[] = await getPayments();
      let filtered = data;
      if (paymentStatus.trim()) {
        const s = paymentStatus.trim().toLowerCase();
        filtered = filtered.filter((p) => p.payment_status.toLowerCase() === s);
      }
      if (paymentMethod.trim()) {
        const m = paymentMethod.trim().toLowerCase();
        filtered = filtered.filter((p) => p.payment_method.toLowerCase() === m);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.transaction_id.toLowerCase().includes(q) ||
            String(p.booking_id).includes(q) ||
            String(p.payment_id).includes(q)
        );
      }
      setPayments(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search payments.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setPaymentStatus("");
    setPaymentMethod("");
    setSearchQuery("");
    await loadPayments();
  }

  async function handleDelete(payment: Payment) {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    setDeletingId(payment.payment_id);
    setError("");
    try {
      await deletePayment(String(payment.payment_id));
      await loadPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete payment.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-description">Manage booking payments.</p>
        </div>
        <Link href="/payments/new" className="primary-button" style={{ textDecoration: "none", display: "inline-block" }}>+ New Payment</Link>
      </div>

      {/* Search / Filter Section */}
      <div className="table-container" style={{ marginBottom: "25px" }}>
        <div className="table-header">Search / Filter Payments</div>
        <form onSubmit={handleSearch} style={{ padding: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
            <div>
              <label htmlFor="filter_search" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Search (Transaction ID, Booking ID)
              </label>
              <input
                id="filter_search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. TXN999999 or 2001"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              />
            </div>
            <div>
              <label htmlFor="filter_status" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Payment Status
              </label>
              <select
                id="filter_status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter_method" style={{ display: "block", marginBottom: "7px", fontWeight: 600, fontSize: "13px" }}>
                Payment Method
              </label>
              <select
                id="filter_method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", fontSize: "14px" }}
              >
                <option value="">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash</option>
              </select>
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
        <div className="table-header">All Payments</div>
        <table>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Booking ID</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Transaction ID</th>
              <th>Payment Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8}>Loading payments...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={8}>No payments found.</td></tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.payment_id}>
                  <td>{payment.payment_id}</td>
                  <td>{payment.booking_id}</td>
                  <td>{payment.amount}</td>
                  <td>{payment.payment_method}</td>
                  <td>{payment.payment_status}</td>
                  <td><Link href={`/payments/${payment.payment_id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>{payment.transaction_id}</Link></td>
                  <td>{payment.payment_date ?? "Not set"}</td>
                  <td>
                    <Link href={`/payments/${payment.payment_id}`} style={{ marginRight: "12px", color: "#2563eb", textDecoration: "none" }}>View</Link>
                    <Link href={`/payments/edit/${payment.payment_id}`} style={{ color: "#16a34a", textDecoration: "none" }}>Edit</Link>
                    <button type="button" onClick={() => handleDelete(payment)} disabled={deletingId === payment.payment_id} style={{ marginLeft: "12px", border: "none", background: "transparent", color: "#dc2626", cursor: deletingId === payment.payment_id ? "not-allowed" : "pointer", fontSize: "13px" }}>{deletingId === payment.payment_id ? "Deleting..." : "Delete"}</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {error && <div style={{ padding: "14px 20px", color: "#b91c1c", background: "#fee2e2" }}>{error}</div>}
      </div>
    </div>
  );
}
